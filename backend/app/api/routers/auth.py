from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import RedirectResponse
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.core.database import get_db
from app.models.core import User
import os
from datetime import datetime, timedelta
import urllib.parse
import json
import base64

router = APIRouter()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
# Frontend URL for redirecting back after connection
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

def get_redirect_uri(request: Request):
    # Depending on where it's hosted, determine the redirect URI
    # We will use the request base url to construct the callback URL dynamically
    base_url = str(request.base_url).rstrip("/")
    return f"{base_url}/api/v1/auth/google/callback"

@router.get("/google/login")
async def google_login(request: Request, user_id: str):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google Client ID not configured")
    
    redirect_uri = get_redirect_uri(request)
    
    # We pass the user_id in the state parameter to know who to link the tokens to in the callback
    state_dict = {"user_id": user_id, "frontend_url": request.headers.get("referer", FRONTEND_URL)}
    state = base64.urlsafe_b64encode(json.dumps(state_dict).encode()).decode()

    auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={GOOGLE_CLIENT_ID}&"
        f"redirect_uri={redirect_uri}&"
        "response_type=code&"
        "scope=https://www.googleapis.com/auth/calendar.readonly&"
        "access_type=offline&"
        "prompt=consent&"
        f"state={state}"
    )
    return RedirectResponse(auth_url)

@router.get("/google/callback")
async def google_callback(request: Request, code: str = None, state: str = None, error: str = None):
    if error:
        return RedirectResponse(f"{FRONTEND_URL}/calendar?error={error}")
    
    if not code or not state:
        raise HTTPException(status_code=400, detail="Missing code or state")

    try:
        state_dict = json.loads(base64.urlsafe_b64decode(state.encode()).decode())
        user_id = state_dict.get("user_id")
        frontend_url = state_dict.get("frontend_url", FRONTEND_URL).rstrip("/")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid state parameter")

    redirect_uri = get_redirect_uri(request)

    # Exchange code for tokens
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(token_url, data=data)
        token_data = response.json()

    if "error" in token_data:
        return RedirectResponse(f"{frontend_url}/calendar?error=oauth_failed")

    access_token = token_data.get("access_token")
    refresh_token = token_data.get("refresh_token")
    expires_in = token_data.get("expires_in", 3600)
    expires_at = datetime.utcnow() + timedelta(seconds=expires_in)

    # Save to database
    async for db in get_db():
        update_data = {
            "google_access_token": access_token,
            "google_token_expires_at": expires_at
        }
        if refresh_token:
            update_data["google_refresh_token"] = refresh_token
            
        await db.execute(
            update(User)
            .where(User.id == user_id)
            .values(**update_data)
        )
        await db.commit()
        break

    # Redirect back to frontend
    return RedirectResponse(f"{frontend_url}/calendar?connected=true")

@router.get("/google/status")
async def google_status(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {
        "is_connected": bool(user.google_access_token or user.google_refresh_token),
        "expires_at": user.google_token_expires_at
    }
