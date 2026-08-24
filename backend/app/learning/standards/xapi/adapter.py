from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.learning import XApiStatement
import uuid

from datetime import datetime, timezone
from app.learning.events import LearningEvent
from app.learning.services.progress_service import ProgressService
from app.models.learning import LearningAttempt
import logging

class XApiAdapter:
    """
    Handles xAPI statement validation, parsing, and mapping to LearningEvent.
    """
    
    @staticmethod
    async def process_statements(statements: List[Dict[str, Any]], db: AsyncSession):
        """
        Processes xAPI statements, resolves attempts, and forwards to ProgressService.
        """
        for stmt in statements:
            stmt_id = stmt.get("id", str(uuid.uuid4()))
            verb = stmt.get("verb", {}).get("id", "").split("/")[-1].lower()
            actor = stmt.get("actor", {})
            
            # 1. Resolve User ID from Actor
            user_id = actor.get("account", {}).get("name")
            if not user_id and actor.get("mbox"):
                user_id = actor.get("mbox").replace("mailto:", "")
                
            if not user_id:
                logging.warning(f"[xAPI] Cannot resolve user_id from actor: {actor}")
                continue
                
            # 2. Resolve Course/Package/Attempt
            registration = stmt.get("context", {}).get("registration")
            activity_id = stmt.get("object", {}).get("id")
            
            # The activity ID usually contains the package_id in our LMS: e.g. /courses/{packageId}
            # Or we can look up by registration if we map it in the DB.
            # For now, we find the active attempt for this user and package/course.
            # If we encoded package_id in activity_id:
            package_id = None
            if activity_id and "/courses/" in activity_id:
                try:
                    package_id = int(activity_id.split("/")[-1])
                except:
                    pass
                    
            if not package_id and registration:
                # Try to resolve activity_id from XApiState if it was launched via state API
                from app.models.learning import XApiState
                state_query = select(XApiState).where(XApiState.registration == registration)
                state_result = await db.execute(state_query)
                state = state_result.scalars().first()
                if state and state.activity_id and "/courses/" in state.activity_id:
                    try:
                        package_id = int(state.activity_id.split("/")[-1])
                    except:
                        pass
            
            query = select(LearningAttempt).where(LearningAttempt.user_id == user_id)
            if package_id:
                query = query.where(LearningAttempt.package_id == package_id)
            elif registration:
                # Fallback: check if we already have a LearningActivityEvent for this registration
                from app.models.learning import LearningActivityEvent
                from sqlalchemy import cast, String
                # Simple textual fallback for JSON
                event_query = select(LearningActivityEvent.attempt_id).where(
                    cast(LearningActivityEvent.metadata_json, String).like(f'%"{registration}"%')
                ).limit(1)
                event_res = await db.execute(event_query)
                attempt_id = event_res.scalars().first()
                if attempt_id:
                    query = query.where(LearningAttempt.id == attempt_id)
                
            query = query.order_by(LearningAttempt.attempt_number.desc())
            result = await db.execute(query)
            attempt = result.scalars().first()
            
            if not attempt:
                logging.warning(f"[xAPI] Cannot resolve active attempt for user {user_id} and activity {activity_id} (registration {registration})")
                continue
                
            # 3. Map Verb to LearningEvent type
            event_type = "experienced"
            progress_pct = None
            score_raw = None
            
            if "completed" in verb:
                event_type = "completed"
                progress_pct = 100
            elif "passed" in verb:
                event_type = "passed"
                progress_pct = 100
            elif "failed" in verb:
                event_type = "failed"
            elif "initialized" in verb:
                event_type = "initialized"
            elif "terminated" in verb:
                event_type = "terminated"
                
            # Parse score from result
            result_obj = stmt.get("result", {})
            if "score" in result_obj:
                score_scaled = result_obj["score"].get("scaled")
                score_raw_val = result_obj["score"].get("raw")
                if score_scaled is not None:
                    score_raw = float(score_scaled) * 100
                elif score_raw_val is not None:
                    score_raw = float(score_raw_val)
                    
            # Parse duration from result
            duration_str = result_obj.get("duration")
            duration_sec = 0
            if duration_str:
                import isodate
                try:
                    duration_sec = int(isodate.parse_duration(duration_str).total_seconds())
                except:
                    pass
            
            # Parse progress extension from result
            extensions = result_obj.get("extensions", {})
            for key, val in extensions.items():
                if "progress" in key.lower():
                    try:
                        progress_pct = int(val)
                    except (ValueError, TypeError):
                        pass
                        
            # Map "progressed" verb or found progress to the "progress" event type
            if "progressed" in verb:
                event_type = "progress"
            elif progress_pct is not None and event_type == "experienced":
                event_type = "progress"
                    
            event = LearningEvent(
                user_id=user_id,
                course_id=attempt.course_id,
                package_id=attempt.package_id,
                attempt_id=attempt.id,
                activity_id=activity_id,
                event_type=event_type,
                progress_percent=progress_pct,
                completion_status="completed" if event_type == "completed" else None,
                success_status="passed" if event_type == "passed" else ("failed" if event_type == "failed" else None),
                score_raw=score_raw,
                duration_seconds=duration_sec,
                timestamp=datetime.now(timezone.utc),
                source_standard="XAPI",
                source_event_id=stmt_id,
                metadata={"verb": verb, "registration": registration}
            )
            
            await ProgressService.process_event(event, db)

