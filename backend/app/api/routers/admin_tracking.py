from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.api.deps import require_admin
from app.models.learning import LearningAttempt, TrackingEventInbox, LearningActivityEvent, ScormRuntimeState, XApiStatement
from typing import List, Dict, Any

router = APIRouter(dependencies=[Depends(require_admin)])

@router.get("/health")
async def get_tracking_health(db: AsyncSession = Depends(get_db)):
    """Get metrics about the asynchronous tracking processing."""
    
    status_counts = await db.execute(
        select(TrackingEventInbox.status, func.count(TrackingEventInbox.id))
        .group_by(TrackingEventInbox.status)
    )
    counts = {row[0]: row[1] for row in status_counts.all()}
    
    return {
        "received": counts.get("received", 0),
        "processing": counts.get("processing", 0),
        "processed": counts.get("processed", 0),
        "retrying": counts.get("retrying", 0),
        "dead_letter": counts.get("dead_letter", 0),
        "failed": counts.get("failed", 0)
    }

@router.get("/attempts")
async def get_all_attempts(db: AsyncSession = Depends(get_db), limit: int = 50, skip: int = 0):
    """Get all learning attempts for the admin course tracking view."""
    from app.models.core import User
    
    query = (
        select(LearningAttempt, User)
        .outerjoin(User, LearningAttempt.user_id == User.id)
        .order_by(LearningAttempt.last_activity_at.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    rows = result.all()
    
    return [
        {
            "id": a.LearningAttempt.id,
            "user_id": a.LearningAttempt.user_id,
            "user_name": f"{a.User.first_name} {a.User.last_name}" if a.User else a.LearningAttempt.user_id,
            "course_id": a.LearningAttempt.course_id,
            "package_id": a.LearningAttempt.package_id,
            "status": a.LearningAttempt.status,
            "progress_percent": a.LearningAttempt.progress_percent,
            "score": a.LearningAttempt.score,
            "total_time_seconds": a.LearningAttempt.total_time_seconds,
            "attempt_number": a.LearningAttempt.attempt_number,
            "standard": a.LearningAttempt.standard,
            "started_at": a.LearningAttempt.started_at,
            "last_activity_at": a.LearningAttempt.last_activity_at,
            "completed_at": a.LearningAttempt.completed_at
        } for a in rows
    ]

@router.get("/attempts/{attempt_id}")
async def get_attempt_details(attempt_id: int, db: AsyncSession = Depends(get_db)):
    """Get detailed view of a single attempt including timeline and raw tracking events."""
    from app.models.core import User
    
    attempt_res = await db.execute(
        select(LearningAttempt, User)
        .outerjoin(User, LearningAttempt.user_id == User.id)
        .where(LearningAttempt.id == attempt_id)
    )
    row = attempt_res.first()
    if not row:
        raise HTTPException(status_code=404, detail="Attempt not found")
        
    attempt, user = row
        
    # Timeline
    timeline_res = await db.execute(
        select(LearningActivityEvent)
        .where(LearningActivityEvent.attempt_id == attempt_id)
        .order_by(LearningActivityEvent.timestamp.desc())
    )
    timeline = timeline_res.scalars().all()
    
    # Inbox Processing events
    inbox_res = await db.execute(
        select(TrackingEventInbox)
        .where(TrackingEventInbox.attempt_id == attempt_id)
        .order_by(TrackingEventInbox.created_at.desc())
    )
    inbox = inbox_res.scalars().all()
    
    # State depending on standard
    state_data = {}
    if attempt.standard in ["scorm_1_2", "scorm_2004"]:
        state_res = await db.execute(select(ScormRuntimeState).where(ScormRuntimeState.attempt_id == attempt_id))
        state = state_res.scalars().first()
        if state:
            state_data = {
                "lesson_status": state.lesson_status,
                "lesson_location": state.lesson_location,
                "score_raw": state.score_raw,
                "session_time": state.session_time,
                "total_time": state.total_time,
                "suspend_data_length": len(state.suspend_data) if state.suspend_data else 0
            }
            
    return {
        "overview": {
            "id": attempt.id,
            "user_id": attempt.user_id,
            "user_name": f"{user.first_name} {user.last_name}" if user else attempt.user_id,
            "status": attempt.status,
            "progress_percent": attempt.progress_percent,
            "score": attempt.score,
            "total_time_seconds": attempt.total_time_seconds,
            "standard": attempt.standard,
            "registration": attempt.xapi_registration_uuid,
            "completion_source": attempt.completion_source,
            "completion_reason": attempt.completion_reason
        },
        "state": state_data,
        "timeline": [
            {
                "event_type": t.event_type,
                "progress": t.progress_percent,
                "score": t.score_raw,
                "timestamp": t.timestamp
            } for t in timeline
        ],
        "processing_inbox": [
            {
                "id": i.id,
                "source": i.source,
                "status": i.status,
                "retry_count": i.retry_count,
                "created_at": i.created_at,
                "processed_at": i.processed_at,
                "last_error": i.last_error
            } for i in inbox
        ]
    }
