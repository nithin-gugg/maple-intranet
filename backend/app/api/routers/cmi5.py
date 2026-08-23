from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any
from app.core.database import get_db
from pydantic import BaseModel
from app.models.learning import LearningAttempt
from app.learning.standards.cmi5.launcher import Cmi5Launcher
from sqlalchemy import select

router = APIRouter()

class InitRequest(BaseModel):
    package_id: int
    user_id: str

@router.post("/initialize")
async def initialize_session(req: InitRequest, db: AsyncSession = Depends(get_db)):
    # 1. Find latest attempt
    attempt_res = await db.execute(
        select(LearningAttempt)
        .where(LearningAttempt.user_id == req.user_id)
        .where(LearningAttempt.package_id == req.package_id)
        .order_by(LearningAttempt.attempt_number.desc())
    )
    attempt = attempt_res.scalars().first()
    
    # 2. Create attempt if it doesn't exist
    if not attempt:
        attempt = LearningAttempt(
            user_id=req.user_id,
            package_id=req.package_id,
            attempt_number=1,
            standard="cmi5",
            status="not attempted"
        )
        db.add(attempt)
        await db.commit()
        await db.refresh(attempt)
        
    # 3. Get or create registration
    registration = await Cmi5Launcher.get_or_create_registration(db, attempt.id)
    
    # 4. Get AU metadata
    au = await Cmi5Launcher.get_au_metadata(db, req.package_id)
    
    return {
        "registration_id": registration.registration_id,
        "au_id": au.au_id,
        "return_url_support": au.return_url_support
    }

@router.post("/fetch")
async def fetch_launch_data(request: Request, registration: str = None, au: str = None, db: AsyncSession = Depends(get_db)):
    """
    The cmi5 fetch endpoint where the AU retrieves its launch configuration
    (auth-token).
    """
    reg_id = registration or request.query_params.get("registration")
    au_id = au or request.query_params.get("au")
    
    if not reg_id or not au_id:
        raise HTTPException(status_code=400, detail="Missing registration or au parameters")
        
    session = await Cmi5Launcher.create_session(db, reg_id, au_id)
        
    return {
        "auth-token": session.auth_token
    }
