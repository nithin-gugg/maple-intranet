from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db

router = APIRouter()

@router.get("/metrics")
async def get_analytics_metrics(
    db: AsyncSession = Depends(get_db),
):
    # Mocking analytics data until DB is populated
    return {
        "activeUsers": 245,
        "coursesCompleted": 1892,
        "documentsViewed": 5430,
        "aiQueries": 892,
        "courseCompletionRate": [
            {"month": "Jan", "rate": 45},
            {"month": "Feb", "rate": 52},
            {"month": "Mar", "rate": 58},
            {"month": "Apr", "rate": 65},
            {"month": "May", "rate": 72},
            {"month": "Jun", "rate": 81},
        ],
        "departmentEngagement": [
            {"name": "Engineering", "value": 85},
            {"name": "Sales", "value": 72},
            {"name": "Marketing", "value": 64},
            {"name": "HR", "value": 92},
        ]
    }
