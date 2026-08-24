from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.learning import LearningAttempt
from app.models.core import User

router = APIRouter()

@router.get("/metrics")
async def get_analytics_metrics(
    db: AsyncSession = Depends(get_db),
):
    # 1. Active Users (Users who had any learning activity in the last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    active_users_query = select(func.count(func.distinct(LearningAttempt.user_id))).where(
        LearningAttempt.last_activity_at >= thirty_days_ago
    )
    active_users_result = await db.execute(active_users_query)
    active_users = active_users_result.scalar() or 0

    # 2. Courses Completed (Overall completed attempts)
    completed_query = select(func.count(LearningAttempt.id)).where(
        or_(LearningAttempt.status == "completed", LearningAttempt.status == "passed")
    )
    completed_result = await db.execute(completed_query)
    courses_completed = completed_result.scalar() or 0

    # Mocks for unimplemented metrics
    return {
        "activeUsers": active_users,
        "coursesCompleted": courses_completed,
        "documentsViewed": 0,
        "aiQueries": 0,
        "courseCompletionRate": [
            {"month": "Jan", "rate": 0},
            {"month": "Feb", "rate": 0},
            {"month": "Mar", "rate": 0},
            {"month": "Apr", "rate": 0},
            {"month": "May", "rate": 0},
            {"month": "Jun", "rate": 0},
        ],
        "departmentEngagement": [
            {"name": "Engineering", "value": 0},
            {"name": "Sales", "value": 0},
            {"name": "Marketing", "value": 0},
            {"name": "HR", "value": 0},
        ]
    }

