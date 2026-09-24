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
from app.core.redis_client import get_redis
from fastapi.encoders import jsonable_encoder

router = APIRouter()

@router.get("/", response_model=None)
async def get_announcements(
    db: AsyncSession = Depends(get_db),
    redis = Depends(get_redis)
    # current_user = Depends(get_current_user)
):
    try:
        cached = await redis.get("cache:announcements")
        if cached:
            return json.loads(cached)
    except Exception as e:
        print(f"Redis cache error: {e}")

    result = await db.execute(select(Announcement).order_by(Announcement.created_at.desc()))
    announcements = result.scalars().all()
    
    try:
        # Cache the announcements for a long time since we invalidate on create
        await redis.setex("cache:announcements", 3600, json.dumps(jsonable_encoder(announcements)))
    except Exception as e:
        print(f"Redis cache error: {e}")
        
    return announcements

class AnnouncementCreate(BaseModel):
    title: str
    content: str
    priority: str = "NORMAL"

@router.post("/", response_model=None)
async def create_announcement(
    announcement: AnnouncementCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_admin),
    redis = Depends(get_redis)
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

    # Invalidate cache
    try:
        await redis.delete("cache:announcements")
    except Exception as e:
        print(f"Redis cache error: {e}")

    return new_announcement
