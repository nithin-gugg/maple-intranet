import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.learning import LearningAttempt, LearningActivityEvent
from app.learning.events import LearningEvent

class ProgressService:
    @staticmethod
    async def process_event(event: LearningEvent, db: AsyncSession):
        # 1. Fetch Attempt
        attempt_res = await db.execute(select(LearningAttempt).where(LearningAttempt.id == event.attempt_id))
        attempt = attempt_res.scalars().first()
        if not attempt:
            return None

        # 2. Record Event for Analytics
        db_event = LearningActivityEvent(
            user_id=event.user_id,
            course_id=event.course_id,
            package_id=event.package_id,
            attempt_id=event.attempt_id,
            activity_id=event.activity_id,
            event_type=event.event_type,
            progress_percent=event.progress_percent,
            completion_status=event.completion_status,
            success_status=event.success_status,
            score_raw=event.score_raw,
            score_scaled=event.score_scaled,
            duration_seconds=event.duration_seconds,
            location=event.location,
            source_standard=event.source_standard,
            source_event_id=event.source_event_id,
            metadata_json=event.metadata,
            timestamp=event.timestamp
        )
        db.add(db_event)

        # 3. Apply state machine rules to LearningAttempt
        is_already_completed = attempt.status in ["completed", "passed"]

        if event.event_type in ["completed", "passed"]:
            if not is_already_completed:
                if event.event_type == "completed":
                    attempt.status = "completed"
                else:
                    attempt.status = "passed"
                    
                attempt.progress_percent = 100
                attempt.completed_at = event.timestamp
                attempt.completion_source = event.source_standard
                attempt.completion_reason = event.event_type
                
        elif event.event_type == "failed":
            if not is_already_completed:
                attempt.status = "failed"
                
        elif event.event_type == "progress":
            if not is_already_completed:
                if attempt.status != "failed":
                    attempt.status = "incomplete"
                
                if event.progress_percent is not None:
                    current_progress = attempt.progress_percent or 0
                    if event.progress_percent > current_progress:
                        attempt.progress_percent = event.progress_percent

        if event.score_raw is not None:
            attempt.score = event.score_raw
            
        if event.duration_seconds is not None:
            if event.source_standard in ["XAPI", "CMI5"]:
                # For xAPI and CMI5, duration is usually session time, so we accumulate it
                current_time = attempt.total_time_seconds or 0
                attempt.total_time_seconds = current_time + event.duration_seconds
            else:
                # SCORM 1.2 and 2004 adapters provide the pre-accumulated total time
                attempt.total_time_seconds = event.duration_seconds

        attempt.last_activity_at = event.timestamp
        
        # Don't commit here, let the router commit at the end of the transaction
        return attempt
