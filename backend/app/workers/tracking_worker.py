import asyncio
import logging
from celery import shared_task
from app.core.celery_app import celery_app
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal
from app.models.learning import TrackingEventInbox

from app.learning.standards.scorm12.adapter import Scorm12Adapter
from app.learning.standards.scorm2004.adapter import Scorm2004Adapter
from app.learning.standards.xapi.adapter import XApiAdapter
from app.learning.services.lrs_service import NativeLRSService
from app.learning.services.progress_service import ProgressService
from app.models.learning import TrackingEventInbox, LearningAttempt, ScormRuntimeState
from sqlalchemy import select

logger = logging.getLogger(__name__)

async def process_tracking_event_async(inbox_id: str):
    async with AsyncSessionLocal() as db:
        # 1. Fetch TrackingEventInbox record
        result = await db.execute(select(TrackingEventInbox).where(TrackingEventInbox.id == inbox_id))
        event = result.scalars().first()
        if not event:
            logger.error(f"TrackingEventInbox not found: {inbox_id}")
            return
            
        if event.status in ["processed", "dead_letter"]:
            return
            
        try:
            event.status = "processing"
            await db.commit()
            
            # 2. Process based on source
            if event.source == "XAPI":
                # The payload is the statement itself (or list of statements)
                statements = event.payload if isinstance(event.payload, list) else [event.payload]
                
                # Store statements in Native LRS
                lrs_service = NativeLRSService(db)
                for stmt in statements:
                    await lrs_service.store_statement(stmt)
                    
                # Process into LearningEvent
                await XApiAdapter.process_statements(statements, db)
                
            elif event.source in ["SCORM_1_2", "SCORM_2004"]:
                # The payload is cmi_data dict. Need attempt.
                attempt_id = event.attempt_id
                if not attempt_id:
                    raise ValueError(f"SCORM tracking event missing attempt_id")
                    
                attempt_res = await db.execute(select(LearningAttempt).where(LearningAttempt.id == attempt_id))
                attempt = attempt_res.scalars().first()
                if not attempt:
                    raise ValueError(f"Attempt not found: {attempt_id}")
                
                cmi_data = event.payload
                
                if event.source == "SCORM_1_2":
                    learning_event = Scorm12Adapter.generate_learning_event(cmi_data, attempt)
                else:
                    learning_event = Scorm2004Adapter.generate_learning_event(cmi_data, attempt)
                    
                if learning_event:
                    await ProgressService.process_event(learning_event, db)
            
            # 3. Mark successful
            event.status = "processed"
            from datetime import datetime, timezone
            event.processed_at = datetime.now(timezone.utc)
            await db.commit()
            
        except Exception as e:
            await db.rollback()
            
            # Re-fetch event to update error state after rollback
            refresh_res = await db.execute(select(TrackingEventInbox).where(TrackingEventInbox.id == inbox_id))
            refreshed_event = refresh_res.scalars().first()
            
            if refreshed_event:
                refreshed_event.retry_count += 1
                refreshed_event.last_error = str(e)
                
                if refreshed_event.retry_count >= 5: # max_retries configured in task decorator
                    refreshed_event.status = "dead_letter"
                else:
                    refreshed_event.status = "retrying"
                    
                await db.commit()
                
            raise e # re-raise for celery to handle retries

@celery_app.task(bind=True, max_retries=5)
def process_tracking_event(self, inbox_id: str):
    """
    Celery task to process a tracking event asynchronously.
    """
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
    try:
        loop.run_until_complete(process_tracking_event_async(inbox_id))
    except Exception as e:
        logger.error(f"Error processing tracking event {inbox_id}: {str(e)}")
        # Raise retry which will use exponential backoff or similar
        raise self.retry(exc=e, countdown=2 ** self.request.retries)
