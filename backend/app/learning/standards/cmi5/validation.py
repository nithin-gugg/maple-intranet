from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.learning import LearningAttempt, Cmi5Registration, Cmi5Session, Cmi5AssignableUnit
from app.learning.standards.cmi5.move_on import Cmi5MoveOnEvaluator
from app.learning.standards.cmi5.session import Cmi5SessionManager
from fastapi import HTTPException
import json

class Cmi5Validator:
    """
    Validates incoming xAPI statements against CMI5 rules and updates LMS tracking.
    """
    
    @staticmethod
    async def process_statements(statements: List[Dict[str, Any]], db: AsyncSession, auth_token: str):
        """
        Validates statements from an AU.
        1. Ensures the auth token is valid and session is active.
        2. Validates registration ID matches the session.
        3. Updates the LearningAttempt progress based on verbs and moveOn rules.
        """
        session = await Cmi5SessionManager.validate_token(db, auth_token)
        if not session:
            raise HTTPException(status_code=401, detail="Invalid or expired CMI5 session.")
            
        registration = await db.execute(select(Cmi5Registration).where(Cmi5Registration.registration_id == session.registration_id))
        registration = registration.scalars().first()
        if not registration:
            raise HTTPException(status_code=400, detail="Invalid registration.")
            
        attempt = await db.execute(select(LearningAttempt).where(LearningAttempt.id == registration.attempt_id))
        attempt = attempt.scalars().first()
        if not attempt:
            raise HTTPException(status_code=400, detail="Attempt not found.")
            
        au = await db.execute(select(Cmi5AssignableUnit).where(Cmi5AssignableUnit.au_id == session.au_id))
        au = au.scalars().first()
        if not au:
            raise HTTPException(status_code=400, detail="Assignable Unit not found.")

        from app.learning.events import LearningEvent
        from app.learning.services.progress_service import ProgressService
        import datetime
        import uuid
        
        # Gather verbs in this batch
        verbs_received = set()
        score_raw = None
        duration_sec = 0
        progress_pct = None
        
        for stmt in statements:
            stmt_reg = stmt.get("context", {}).get("registration")
            if stmt_reg and stmt_reg != session.registration_id:
                raise HTTPException(status_code=400, detail="Registration UUID mismatch in statement.")
                
            verb = stmt.get("verb", {}).get("id", "")
            if "completed" in verb:
                verbs_received.add("completed")
            elif "passed" in verb:
                verbs_received.add("passed")
            elif "failed" in verb:
                verbs_received.add("failed")
            elif "terminated" in verb:
                verbs_received.add("terminated")
                
            # Score
            result = stmt.get("result", {})
            if "score" in result:
                score_scaled = result["score"].get("scaled")
                score_raw_val = result["score"].get("raw")
                if score_scaled is not None:
                    score_raw = float(score_scaled) * 100
                elif score_raw_val is not None:
                    score_raw = float(score_raw_val)
                    
            duration_str = result.get("duration")
            if duration_str:
                import isodate
                try:
                    duration_sec = int(isodate.parse_duration(duration_str).total_seconds())
                except:
                    pass
                    
            extensions = result.get("extensions", {})
            for key, val in extensions.items():
                if "progress" in key.lower():
                    try:
                        progress_pct = int(val)
                    except (ValueError, TypeError):
                        pass

        # Evaluate MoveOn
        can_move_on = Cmi5MoveOnEvaluator.evaluate(au.move_on, verbs_received)
        
        event_type = "progress"
        if can_move_on:
            event_type = "completed"
        elif "failed" in verbs_received:
            event_type = "failed"
            
        if event_type in ["completed", "passed"]:
            progress_pct = 100
                
        # Terminate session if terminated verb received
        if "terminated" in verbs_received:
            session.is_active = False
            
        event = LearningEvent(
            user_id=attempt.user_id,
            course_id=attempt.course_id,
            package_id=attempt.package_id,
            attempt_id=attempt.id,
            activity_id=session.au_id,
            event_type=event_type,
            progress_percent=progress_pct,
            completion_status="completed" if event_type == "completed" else None,
            success_status="passed" if event_type == "passed" else ("failed" if event_type == "failed" else None),
            score_raw=score_raw,
            duration_seconds=duration_sec,
            timestamp=datetime.datetime.now(datetime.timezone.utc),
            source_standard="CMI5",
            source_event_id=str(uuid.uuid4()),
            metadata={"verbs": list(verbs_received)}
        )
        
        await ProgressService.process_event(event, db)
        await db.commit()
