from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.core.database import get_db
from app.models.communication import Event
from app.models.core import User
from app.api.deps import get_current_user
import httpx
from datetime import datetime
import os

router = APIRouter()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

@router.get("/", response_model=None)
async def get_events(
    db: AsyncSession = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    result = await db.execute(select(Event))
    return result.scalars().all()

async def refresh_google_token(user: User, db: AsyncSession):
    if not user.google_refresh_token:
        return None

    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "refresh_token": user.google_refresh_token,
        "grant_type": "refresh_token",
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(token_url, data=data)
        if response.status_code != 200:
            return None
            
        token_data = response.json()
        
    access_token = token_data.get("access_token")
    if not access_token:
        return None
        
    # Update DB
    user.google_access_token = access_token
    await db.execute(
        update(User).where(User.id == user.id).values(google_access_token=access_token)
    )
    await db.commit()
    return access_token

@router.get("/google-events")
async def get_google_events(
    timeMin: str,
    timeMax: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not current_user.google_access_token:
        return []

    token = current_user.google_access_token
    
    async def fetch_events(access_token: str):
        url = f"https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin={timeMin}&timeMax={timeMax}&singleEvents=true&orderBy=startTime"
        async with httpx.AsyncClient() as client:
            return await client.get(url, headers={"Authorization": f"Bearer {access_token}"})

    response = await fetch_events(token)
    
    # If unauthorized, try to refresh token
    if response.status_code == 401:
        new_token = await refresh_google_token(current_user, db)
        if not new_token:
            return []
        response = await fetch_events(new_token)
        
    if response.status_code != 200:
        return []

    data = response.json()
    items = data.get("items", [])
    
    events = []
    for item in items:
        # FullCalendar expects title, start, end, url, color
        start = item.get("start", {}).get("dateTime") or item.get("start", {}).get("date")
        end = item.get("end", {}).get("dateTime") or item.get("end", {}).get("date")
        events.append({
            "title": item.get("summary", "Busy"),
            "start": start,
            "end": end,
            "url": item.get("htmlLink"),
            "color": "#4285F4"
        })
        
    return events
