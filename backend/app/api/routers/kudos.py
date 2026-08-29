from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from typing import List, Optional
from app.core.database import get_db
from app.models.core import Employee, User
from app.models.kudos import Kudos, KudosReason, KudosPresent, KudosStatus
from app.schemas.kudos import KudosCreate, KudosSchema, KudosReasonSchema, KudosPresentSchema, KudosStats, LeaderboardEntry
from app.api.deps import get_current_user
from sqlalchemy.orm import selectinload
from app.api.routers.websockets import manager
import json

router = APIRouter()

@router.get("/reasons", response_model=List[KudosReasonSchema])
async def get_kudos_reasons(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(KudosReason).where(KudosReason.is_active == True))
    return result.scalars().all()

@router.get("/presents", response_model=List[KudosPresentSchema])
async def get_kudos_presents(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(KudosPresent).where(KudosPresent.is_active == True))
    return result.scalars().all()

from app.models.communication import Notification

@router.post("/", response_model=KudosSchema)
async def create_kudos(
    kudos_in: KudosCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    employee = await db.get(Employee, current_user.id)
    if not employee:
        raise HTTPException(status_code=403, detail="Only employees can give kudos")
    
    sender_id = current_user.id
    if sender_id == kudos_in.recipient_id:
        raise HTTPException(status_code=400, detail="You cannot give kudos to yourself")

    # Validate recipient
    recipient = await db.get(Employee, kudos_in.recipient_id)
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")

    # Validate reason
    reason = await db.get(KudosReason, kudos_in.reason_id)
    if not reason or not reason.is_active:
        raise HTTPException(status_code=400, detail="Invalid reason")

    # Validate present
    present = None
    if kudos_in.present_id:
        present = await db.get(KudosPresent, kudos_in.present_id)
        if not present or not present.is_active:
            raise HTTPException(status_code=400, detail="Invalid present")

    new_kudos = Kudos(
        sender_id=sender_id,
        recipient_id=kudos_in.recipient_id,
        reason_id=kudos_in.reason_id,
        present_id=kudos_in.present_id,
        message=kudos_in.message,
        stars=kudos_in.stars,
        status=KudosStatus.ACTIVE
    )
    
    db.add(new_kudos)
    await db.commit()
    await db.refresh(new_kudos)
    
    # Reload with relations for response
    query = select(Kudos).options(
        selectinload(Kudos.reason),
        selectinload(Kudos.present),
        selectinload(Kudos.sender).selectinload(Employee.user),
        selectinload(Kudos.recipient).selectinload(Employee.user)
    ).where(Kudos.id == new_kudos.id)
    
    result = await db.execute(query)
    full_kudos = result.scalars().first()
    
    # Prepare response dict
    response_data = {
        "id": full_kudos.id,
        "sender_id": full_kudos.sender_id,
        "recipient_id": full_kudos.recipient_id,
        "reason_id": full_kudos.reason_id,
        "present_id": full_kudos.present_id,
        "message": full_kudos.message,
        "stars": full_kudos.stars,
        "status": full_kudos.status,
        "created_at": full_kudos.created_at,
        "reason": full_kudos.reason,
        "present": full_kudos.present,
        "sender": {
            "id": full_kudos.sender.id,
            "first_name": full_kudos.sender.user.first_name,
            "last_name": full_kudos.sender.user.last_name,
            "avatar": full_kudos.sender.user.profile_image_url,
            "designation": full_kudos.sender.designation
        },
        "recipient": {
            "id": full_kudos.recipient.id,
            "first_name": full_kudos.recipient.user.first_name,
            "last_name": full_kudos.recipient.user.last_name,
            "avatar": full_kudos.recipient.user.profile_image_url,
            "designation": full_kudos.recipient.designation
        }
    }
    
    # Broadcast notification via websocket
    title = "New Kudos Recognized!"
    message = f"{full_kudos.sender.user.first_name} recognized {full_kudos.recipient.user.first_name} for {reason.name} with {kudos_in.stars} stars! 🌟"
    
    notification_msg = {
        "type": "NEW_KUDOS",
        "data": {
            "title": title,
            "message": message,
            "kudos_id": full_kudos.id
        }
    }
    await manager.broadcast(json.dumps(notification_msg))

    # Save notification to database for ALL active users
    users_query = select(User).where(User.is_active == True)
    users_result = await db.execute(users_query)
    all_users = users_result.scalars().all()
    
    notifications = []
    for u in all_users:
        notifications.append(
            Notification(
                user_id=u.id,
                title=title,
                message=message,
                type="KUDOS",
                is_read=False
            )
        )
    
    db.add_all(notifications)
    await db.commit()

    return response_data

@router.get("/", response_model=List[KudosSchema])
async def get_kudos_feed(limit: int = 50, db: AsyncSession = Depends(get_db)):
    query = select(Kudos).options(
        selectinload(Kudos.reason),
        selectinload(Kudos.present),
        selectinload(Kudos.sender).selectinload(Employee.user),
        selectinload(Kudos.recipient).selectinload(Employee.user)
    ).where(Kudos.status == KudosStatus.ACTIVE).order_by(desc(Kudos.created_at)).limit(limit)
    
    result = await db.execute(query)
    kudos_list = result.scalars().all()
    
    response = []
    for k in kudos_list:
        response.append({
            "id": k.id,
            "sender_id": k.sender_id,
            "recipient_id": k.recipient_id,
            "reason_id": k.reason_id,
            "present_id": k.present_id,
            "message": k.message,
            "stars": k.stars,
            "status": k.status,
            "created_at": k.created_at,
            "reason": k.reason,
            "present": k.present,
            "sender": {
                "id": k.sender.id,
                "first_name": k.sender.user.first_name,
                "last_name": k.sender.user.last_name,
                "avatar": k.sender.user.profile_image_url,
                "designation": k.sender.designation
            },
            "recipient": {
                "id": k.recipient.id,
                "first_name": k.recipient.user.first_name,
                "last_name": k.recipient.user.last_name,
                "avatar": k.recipient.user.profile_image_url,
                "designation": k.recipient.designation
            }
        })
    return response

@router.get("/my", response_model=KudosStats)
async def get_my_recognition(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_id = current_user.id
    
    # Total received
    kudos_query = select(Kudos).where(Kudos.recipient_id == user_id, Kudos.status == KudosStatus.ACTIVE)
    result = await db.execute(kudos_query)
    kudos_list = result.scalars().all()
    
    total_received = len(kudos_list)
    stars_received = sum(k.stars for k in kudos_list)
    presents_received = sum(1 for k in kudos_list if k.present_id is not None)
    
    # Most common reason
    most_common_reason = None
    if kudos_list:
        reason_counts = {}
        for k in kudos_list:
            reason_counts[k.reason_id] = reason_counts.get(k.reason_id, 0) + 1
        
        most_common_reason_id = max(reason_counts, key=reason_counts.get)
        reason = await db.get(KudosReason, most_common_reason_id)
        if reason:
            most_common_reason = reason.name

    return {
        "total_received": total_received,
        "stars_received": stars_received,
        "presents_received": presents_received,
        "most_common_reason": most_common_reason
    }

@router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(limit: int = 10, db: AsyncSession = Depends(get_db)):
    query = select(
        Kudos.recipient_id,
        func.sum(Kudos.stars).label("total_stars"),
        func.count(Kudos.id).label("kudos_count")
    ).where(Kudos.status == KudosStatus.ACTIVE).group_by(Kudos.recipient_id).order_by(desc("total_stars")).limit(limit)
    
    result = await db.execute(query)
    leaderboard_data = result.all()
    
    response = []
    for row in leaderboard_data:
        recipient = await db.get(Employee, row.recipient_id)
        # Using selectinload for user would be more efficient, but let's just fetch it here for simplicity
        user_query = select(User).where(User.id == row.recipient_id)
        user_result = await db.execute(user_query)
        user = user_result.scalars().first()
        
        if user and recipient:
            response.append({
                "employee_id": row.recipient_id,
                "employee_name": f"{user.first_name} {user.last_name}",
                "employee_avatar": user.profile_image_url,
                "designation": recipient.designation,
                "total_stars": row.total_stars,
                "kudos_count": row.kudos_count
            })
            
    return response

@router.get("/stats")
async def get_global_stats(db: AsyncSession = Depends(get_db)):
    # Total kudos
    total_kudos_query = select(func.count(Kudos.id)).where(Kudos.status == KudosStatus.ACTIVE)
    total_kudos = (await db.execute(total_kudos_query)).scalar() or 0
    
    # Total stars
    total_stars_query = select(func.sum(Kudos.stars)).where(Kudos.status == KudosStatus.ACTIVE)
    total_stars = (await db.execute(total_stars_query)).scalar() or 0
    
    # Employees recognized
    employees_recognized_query = select(func.count(func.distinct(Kudos.recipient_id))).where(Kudos.status == KudosStatus.ACTIVE)
    employees_recognized = (await db.execute(employees_recognized_query)).scalar() or 0
    
    # Presents given
    presents_given_query = select(func.count(Kudos.id)).where(Kudos.present_id.isnot(None), Kudos.status == KudosStatus.ACTIVE)
    presents_given = (await db.execute(presents_given_query)).scalar() or 0
    
    return {
        "total_kudos": total_kudos,
        "stars_given": total_stars,
        "employees_recognized": employees_recognized,
        "presents_given": presents_given
    }
