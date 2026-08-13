from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.communication import Event
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=None)
async def get_events(
    db: AsyncSession = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    result = await db.execute(select(Event))
    return result.scalars().all()
