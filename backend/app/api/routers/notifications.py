from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from app.core.database import get_db
from app.models.communication import Notification
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=None)
async def get_notifications(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
    )
    return result.scalars().all()

@router.post("/clear")
async def clear_notifications(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    await db.execute(
        delete(Notification)
        .where(Notification.user_id == current_user.id)
    )
    await db.commit()
    return {"success": True}
