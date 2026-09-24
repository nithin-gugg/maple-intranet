from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.core.database import get_db
from app.models.communication import Event
from app.models.core import User
from app.api.deps import get_current_user
import httpx
from datetime import datetime
import os
import uuid
import json
from app.core.redis_client import get_redis

router = APIRouter()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

@router.get("/", response_model=None)
async def get_events(
    db: AsyncSession = Depends(get_db),
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

async def get_valid_google_token(user: User, db: AsyncSession) -> str:
    if not user.google_access_token:
        raise HTTPException(status_code=401, detail="Google Calendar not connected")
    return user.google_access_token

async def google_api_request(user: User, db: AsyncSession, method: str, url: str, **kwargs):
    token = await get_valid_google_token(user, db)
    
    headers = kwargs.pop("headers", {})
    headers["Authorization"] = f"Bearer {token}"
    
    async with httpx.AsyncClient() as client:
        response = await client.request(method, url, headers=headers, **kwargs)
        
        # If unauthorized, refresh and retry exactly once
        if response.status_code == 401:
            new_token = await refresh_google_token(user, db)
            if not new_token:
                raise HTTPException(status_code=401, detail="Google session expired. Please reconnect.")
            headers["Authorization"] = f"Bearer {new_token}"
            response = await client.request(method, url, headers=headers, **kwargs)
            
        if response.status_code not in (200, 204):
            raise HTTPException(status_code=response.status_code, detail=f"Google API Error: {response.text}")
            
        return response

def build_google_event_body(payload: dict) -> dict:
    # Converts simplified frontend payload to Google API format
    event_body = {
        "summary": payload.get("title", ""),
        "description": payload.get("description", ""),
        "location": payload.get("location", ""),
    }
    
    if payload.get("allDay"):
        event_body["start"] = {"date": payload.get("start").split("T")[0]}
        event_body["end"] = {"date": payload.get("end").split("T")[0]}
    else:
        event_body["start"] = {"dateTime": payload.get("start")}
        event_body["end"] = {"dateTime": payload.get("end")}
        if payload.get("timezone"):
            event_body["start"]["timeZone"] = payload.get("timezone")
            event_body["end"]["timeZone"] = payload.get("timezone")
            
    if payload.get("attendees"):
        # Expects a list of emails
        event_body["attendees"] = [{"email": email.strip()} for email in payload.get("attendees", []) if email.strip()]

    # Recurrence support
    if payload.get("recurrence"):
        event_body["recurrence"] = payload.get("recurrence")
        
    # Reminders
    if payload.get("reminders"):
        event_body["reminders"] = {
            "useDefault": False,
            "overrides": payload.get("reminders")
        }

    create_meet = payload.get("create_meet", False)
    if create_meet:
        event_body["conferenceData"] = {
            "createRequest": {
                "requestId": str(uuid.uuid4()),
                "conferenceSolutionKey": {"type": "hangoutsMeet"}
            }
        }
        
    return event_body

@router.get("/google-calendars")
async def list_google_calendars(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    response = await google_api_request(
        current_user, db, "GET", 
        "https://www.googleapis.com/calendar/v3/users/me/calendarList"
    )
    return response.json()

@router.get("/google-events")
async def get_google_events(
    timeMin: str,
    timeMax: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    redis = Depends(get_redis)
):
    # Try to fetch from cache
    cache_key = f"calendar:events:{current_user.id}:{timeMin}:{timeMax}"
    try:
        cached_events = await redis.get(cache_key)
        if cached_events:
            return json.loads(cached_events)
    except Exception as e:
        print(f"Redis cache error: {e}")

    try:
        url = f"https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin={timeMin}&timeMax={timeMax}&singleEvents=true&orderBy=startTime"
        response = await google_api_request(current_user, db, "GET", url)
    except HTTPException as e:
        if e.status_code == 401:
            return []
        raise e
        
    data = response.json()
    items = data.get("items", [])
    
    events = []
    for item in items:
        start = item.get("start", {}).get("dateTime") or item.get("start", {}).get("date")
        end = item.get("end", {}).get("dateTime") or item.get("end", {}).get("date")
        
        meet_url = None
        if "conferenceData" in item:
            for entry_point in item["conferenceData"].get("entryPoints", []):
                if entry_point.get("entryPointType") == "video":
                    meet_url = entry_point.get("uri")
                    
        events.append({
            "id": item.get("id"),
            "title": item.get("summary", "Busy"),
            "start": start,
            "end": end,
            "url": item.get("htmlLink"),
            "color": "#4285F4",
            "meet_url": meet_url
        })
        
    # Cache the successful response for 60 seconds to improve performance
    try:
        await redis.setex(cache_key, 60, json.dumps(events))
    except Exception as e:
        print(f"Redis cache error: {e}")
        
    return events

@router.post("/google-events")
async def create_google_event(
    payload: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    event_body = build_google_event_body(payload)
    url = "https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all"
    
    if payload.get("create_meet"):
        url += "&conferenceDataVersion=1"
        
    response = await google_api_request(current_user, db, "POST", url, json=event_body)
    return response.json()

@router.put("/google-events/{event_id}")
async def update_google_event(
    event_id: str,
    payload: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    event_body = build_google_event_body(payload)
    url = f"https://www.googleapis.com/calendar/v3/calendars/primary/events/{event_id}?sendUpdates=all"
    
    if payload.get("create_meet"):
        url += "&conferenceDataVersion=1"
        
    response = await google_api_request(current_user, db, "PUT", url, json=event_body)
    return response.json()

@router.delete("/google-events/{event_id}")
async def delete_google_event(
    event_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    url = f"https://www.googleapis.com/calendar/v3/calendars/primary/events/{event_id}?sendUpdates=all"
    try:
        await google_api_request(current_user, db, "DELETE", url)
    except HTTPException as e:
        if e.status_code == 404:
            return {"status": "already_deleted"}
        raise e
    return {"status": "success"}

@router.post("/freebusy")
async def query_freebusy(
    payload: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    url = "https://www.googleapis.com/calendar/v3/freeBusy"
    body = {
        "timeMin": payload.get("timeMin"),
        "timeMax": payload.get("timeMax"),
        "timeZone": payload.get("timeZone", "UTC"),
        "items": payload.get("items", [{"id": "primary"}])
    }
    response = await google_api_request(current_user, db, "POST", url, json=body)
    return response.json()
