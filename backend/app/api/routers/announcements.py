from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.communication import Announcement, Notification
from app.api.deps import get_current_user, require_admin
from pydantic import BaseModel
import json
from app.api.routers.websockets import manager
from sqlalchemy import text

router = APIRouter()

@router.get("/", response_model=None)
async def get_announcements(
    db: AsyncSession = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    result = await db.execute(select(Announcement).order_by(Announcement.created_at.desc()))
    return result.scalars().all()

class AnnouncementCreate(BaseModel):
    title: str
    content: str
    priority: str = "NORMAL"

@router.post("/", response_model=None)
async def create_announcement(
    announcement: AnnouncementCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_admin)
):
    
    new_announcement = Announcement(
        title=announcement.title,
        content=announcement.content,
        priority=announcement.priority,
        created_by_id=current_user.id
    )
    db.add(new_announcement)
    await db.commit()
    await db.refresh(new_announcement)

    # Note: To avoid creating thousands of notifications synchronously, 
    # for MVP we assume a smaller user base. Let's fetch all users.
    # We don't have a direct Users model imported, so we will use a raw query or just broadcast the WS.
    # Actually, saving a Notification for each user might be heavy. Let's just create a generic one
    # OR we broadcast via WebSocket and if they are online they get it. 
    # To support the notification dropdown, we need it in the DB.
    # Let's fetch all user IDs.
    user_ids = await db.execute(text("SELECT id FROM users"))
    users = user_ids.fetchall()

    notifications = []
    for user in users:
        notifications.append(
            Notification(
                user_id=user.id,
                title="New Announcement",
                message=announcement.title,
                type="ANNOUNCEMENT"
            )
        )
    
    db.add_all(notifications)
    await db.commit()

    # Broadcast via WebSocket
    payload = {
        "type": "NEW_ANNOUNCEMENT",
        "data": {
            "id": new_announcement.id,
            "title": new_announcement.title,
            "content": new_announcement.content,
            "priority": new_announcement.priority,
            "created_at": new_announcement.created_at.isoformat(),
            "author": current_user.email # or name
        }
    }
    await manager.broadcast(json.dumps(payload))

    return new_announcement
