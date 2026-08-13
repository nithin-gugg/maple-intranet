from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.core import Department, User
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=None)
async def get_departments(
    db: AsyncSession = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Department).where(Department.is_archived == False))
    return result.scalars().all()
