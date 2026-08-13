from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.learning import LearningSession, LearningTracking

router = APIRouter()

class InitRequest(BaseModel):
    package_id: int
    user_id: str

class CmiRequest(BaseModel):
    session_id: int
    cmi_key: str
    cmi_value: str = None

@router.post("/initialize")
async def initialize_session(req: InitRequest, db: AsyncSession = Depends(get_db)):
    session = LearningSession(
        user_id=req.user_id,
        package_id=req.package_id,
        lesson_status="unknown"
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return {"session_id": session.id, "error": "0"}

@router.post("/getvalue")
async def get_value(req: CmiRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(LearningTracking)
        .where(LearningTracking.session_id == req.session_id)
        .where(LearningTracking.cmi_key == req.cmi_key)
    )
    record = result.scalars().first()
    
    if not record:
        if req.cmi_key == "cmi.learner_id":
            return {"value": "mock_learner_2004", "error": "0"}
        if req.cmi_key == "cmi.learner_name":
            return {"value": "Learner, Mock", "error": "0"}
        if req.cmi_key == "cmi.completion_status":
            return {"value": "unknown", "error": "0"}
        if req.cmi_key == "cmi.success_status":
            return {"value": "unknown", "error": "0"}
        return {"value": "", "error": "0"}

    return {"value": record.cmi_value, "error": "0"}

@router.post("/setvalue")
async def set_value(req: CmiRequest, db: AsyncSession = Depends(get_db)):
    if not req.cmi_value:
        return {"error": "351"} # SCORM 2004 general set failure

    result = await db.execute(
        select(LearningTracking)
        .where(LearningTracking.session_id == req.session_id)
        .where(LearningTracking.cmi_key == req.cmi_key)
    )
    record = result.scalars().first()

    if record:
        record.cmi_value = req.cmi_value
    else:
        record = LearningTracking(
            session_id=req.session_id,
            cmi_key=req.cmi_key,
            cmi_value=req.cmi_value
        )
        db.add(record)
    
    # Map SCORM 2004 statuses to session
    if req.cmi_key == "cmi.completion_status":
        session_res = await db.execute(select(LearningSession).where(LearningSession.id == req.session_id))
        session = session_res.scalars().first()
        if session:
            session.lesson_status = req.cmi_value
            
    if req.cmi_key == "cmi.score.raw":
        session_res = await db.execute(select(LearningSession).where(LearningSession.id == req.session_id))
        session = session_res.scalars().first()
        if session:
            try:
                session.score_raw = int(float(req.cmi_value))
            except:
                pass
                
    await db.commit()
    return {"error": "0"}

@router.post("/commit")
async def commit_data(req: CmiRequest, db: AsyncSession = Depends(get_db)):
    return {"error": "0"}

@router.post("/terminate")
async def terminate_session(req: CmiRequest, db: AsyncSession = Depends(get_db)):
    # SCORM 2004 uses Terminate() instead of Finish()
    session_res = await db.execute(select(LearningSession).where(LearningSession.id == req.session_id))
    session = session_res.scalars().first()
    if session:
        pass
    return {"error": "0"}
