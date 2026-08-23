import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.core.database import get_db
from app.models.learning import LearningAttempt, ScormRuntimeState, LearningPackage
from app.learning.standards.scorm12.adapter import Scorm12Adapter
from app.learning.standards.scorm2004.adapter import Scorm2004Adapter

router = APIRouter()

class InitRequest(BaseModel):
    package_id: int
    user_id: str

class CommitRequest(BaseModel):
    attempt_id: int
    cmi_data: dict

@router.post("/initialize")
async def initialize_session(req: InitRequest, db: AsyncSession = Depends(get_db)):
    # 1. Check if package exists
    pkg_res = await db.execute(select(LearningPackage).where(LearningPackage.id == req.package_id))
    package = pkg_res.scalars().first()
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
        
    # 2. Find latest attempt
    attempt_res = await db.execute(
        select(LearningAttempt)
        .where(LearningAttempt.user_id == req.user_id)
        .where(LearningAttempt.package_id == req.package_id)
        .order_by(LearningAttempt.attempt_number.desc())
    )
    attempt = attempt_res.scalars().first()
    
    # 3. Create attempt if it doesn't exist
    if not attempt:
        attempt = LearningAttempt(
            user_id=req.user_id,
            package_id=req.package_id,
            attempt_number=1,
            standard=package.package_type,
            status="incomplete" if package.package_type == "scorm_1_2" else "unknown"
        )
        db.add(attempt)
        await db.commit()
        await db.refresh(attempt)
        
    # 4. Find or create ScormRuntimeState
    state_res = await db.execute(select(ScormRuntimeState).where(ScormRuntimeState.attempt_id == attempt.id))
    state = state_res.scalars().first()
    
    if not state:
        # Initialize default CMI data based on standard
        cmi_data = {}
        if attempt.standard == "scorm_1_2":
            cmi_data = Scorm12Adapter.get_initial_cmi(req.user_id, "Learner, Mock")
            cmi_data["cmi.core.entry"] = "ab-initio"
        elif attempt.standard == "scorm_2004":
            cmi_data = Scorm2004Adapter.get_initial_cmi(req.user_id, "Learner, Mock")
            
        columns = Scorm12Adapter.extract_state_columns(cmi_data)
        state = ScormRuntimeState(
            attempt_id=attempt.id, 
            package_id=req.package_id,
            cmi_data=cmi_data,
            **columns
        )
        db.add(state)
        await db.commit()
        await db.refresh(state)
    else:
        # Reconstruct cmi_data from explicitly stored columns to serve to the frontend
        if attempt.standard == "scorm_1_2":
            cmi_data = state.cmi_data or {}
            
            # Repopulate from columns
            if state.lesson_status: cmi_data["cmi.core.lesson_status"] = state.lesson_status
            if state.lesson_location: cmi_data["cmi.core.lesson_location"] = state.lesson_location
            if state.suspend_data: cmi_data["cmi.suspend_data"] = state.suspend_data
            if state.score_raw is not None: cmi_data["cmi.core.score.raw"] = str(state.score_raw)
            if state.score_min is not None: cmi_data["cmi.core.score.min"] = str(state.score_min)
            if state.score_max is not None: cmi_data["cmi.core.score.max"] = str(state.score_max)
            if state.total_time: cmi_data["cmi.core.total_time"] = state.total_time
            if state.lesson_mode: cmi_data["cmi.core.lesson_mode"] = state.lesson_mode
            if state.credit: cmi_data["cmi.core.credit"] = state.credit
            
            # Logic for Entry
            if state.exit == "suspend" or (state.suspend_data and len(state.suspend_data) > 0):
                cmi_data["cmi.core.entry"] = "resume"
            else:
                cmi_data["cmi.core.entry"] = ""
                
            # Clear session time on new launch
            cmi_data["cmi.core.session_time"] = "00:00:00"
        else:
            cmi_data = state.cmi_data

    return {
        "attempt_id": attempt.id,
        "standard": attempt.standard,
        "cmi_data": cmi_data,
        "error": "0"
    }

@router.post("/commit")
async def commit_data(req: CommitRequest, db: AsyncSession = Depends(get_db)):
    print(f"\n[TRACE 3] ===============================================")
    print(f"[TRACE 3] /commit endpoint received")
    print(f"[TRACE 3] attempt ID: {req.attempt_id}")
    print(f"[TRACE 3] received CMI keys: {list(req.cmi_data.keys())}")
    print(f"[TRACE 3] received cmi.core.lesson_status: {req.cmi_data.get('cmi.core.lesson_status')}")
    print(f"[TRACE 3] ===============================================\n")

    # 1. Find the runtime state
    state_res = await db.execute(select(ScormRuntimeState).where(ScormRuntimeState.attempt_id == req.attempt_id))
    state = state_res.scalars().first()
    
    if not state:
        return {"error": "201"} # Invalid argument / not found
        
    # 2. Update the CMI JSON data
    new_cmi = {**(state.cmi_data or {}), **req.cmi_data}
    
    # 3. Accumulate Time
    if "cmi.core.session_time" in req.cmi_data:
        total_time_str = state.total_time or "00:00:00"
        session_time_str = req.cmi_data["cmi.core.session_time"]
        new_total_time = Scorm12Adapter.calculate_total_time(total_time_str, session_time_str)
        new_cmi["cmi.core.total_time"] = new_total_time
    
    # 4. Extract strongly typed columns
    columns = Scorm12Adapter.extract_state_columns(new_cmi)
    for key, value in columns.items():
        if value is not None:
            setattr(state, key, value)
            
    # Clear session time from DB so it's not accumulated twice if they don't reset it
    if "cmi.core.session_time" in req.cmi_data:
        state.session_time = "00:00:00"
        
    state.cmi_data = new_cmi 
    
    # 5. Update the LearningAttempt model based on the CMI data
    attempt_res = await db.execute(select(LearningAttempt).where(LearningAttempt.id == req.attempt_id))
    attempt = attempt_res.scalars().first()
    
    if attempt:
        print(f"\n[TRACE 3] Found attempt. user ID: {attempt.user_id}, course ID: {attempt.course_id}, package ID: {attempt.package_id}")
        
        if attempt.standard == "scorm_1_2":
            from app.learning.services.progress_service import ProgressService
            
            print(f"\n[TRACE 4] ---------------------------------------------")
            print(f"[TRACE 4] Calling Scorm12Adapter.generate_learning_event()")
            print(f"[TRACE 4] current lesson_status in CMI state: {new_cmi.get('cmi.core.lesson_status')}")
            print(f"[TRACE 4] previous attempt progress: {attempt.progress_percent}% (status: {attempt.status})")
            
            event = Scorm12Adapter.generate_learning_event(new_cmi, attempt)
            
            print(f"[TRACE 4] generated event: {event.dict()}")
            print(f"[TRACE 4] Sending to ProgressService")
            print(f"[TRACE 4] ---------------------------------------------\n")
            
            await ProgressService.process_event(event, db)
            
        elif attempt.standard == "scorm_2004":
            updates = Scorm2004Adapter.update_attempt_from_cmi(new_cmi)
            for key, value in updates.items():
                setattr(attempt, key, value)
            
    await db.commit()
    
    if attempt:
        await db.refresh(attempt)
        print(f"\n[TRACE 5] ===============================================")
        print(f"[TRACE 5] After database commit. Reading back LearningAttempt...")
        print(f"[TRACE 5] attempt ID: {attempt.id}")
        print(f"[TRACE 5] progress_percent: {attempt.progress_percent}")
        print(f"[TRACE 5] status: {attempt.status}")
        print(f"[TRACE 5] updated_at: {attempt.last_activity_at}")
        print(f"[TRACE 5] ===============================================\n")
        
    return {"error": "0"}

@router.post("/finish")
async def finish_session(req: CommitRequest, db: AsyncSession = Depends(get_db)):
    # Commit any final data first
    await commit_data(req, db)
    
    # Mark attempt as completed if appropriate
    attempt_res = await db.execute(select(LearningAttempt).where(LearningAttempt.id == req.attempt_id))
    attempt = attempt_res.scalars().first()
    
    if attempt:
        import datetime
        # If we didn't already set a completed status, and they triggered finish, we might mark time
        attempt.last_activity_at = datetime.datetime.utcnow()
        await db.commit()
        
    return {"error": "0"}

@router.get("/attempts/{attempt_id}/runtime-state")
async def get_runtime_state(attempt_id: int, db: AsyncSession = Depends(get_db)):
    state_res = await db.execute(select(ScormRuntimeState).where(ScormRuntimeState.attempt_id == attempt_id))
    state = state_res.scalars().first()
    if not state:
        raise HTTPException(status_code=404, detail="Runtime state not found")
        
    attempt_res = await db.execute(select(LearningAttempt).where(LearningAttempt.id == attempt_id))
    attempt = attempt_res.scalars().first()
    
    return {
        "attempt_id": attempt.id,
        "standard": attempt.standard,
        "package_id": attempt.package_id,
        "status": attempt.status,
        "progress_percent": attempt.progress_percent,
        "state": {
            "lesson_status": state.lesson_status,
            "lesson_location": state.lesson_location,
            "suspend_data_present": state.suspend_data is not None and len(state.suspend_data) > 0,
            "score_raw": state.score_raw,
            "session_time": state.session_time,
            "total_time": state.total_time,
            "entry": state.entry,
            "exit": state.exit
        },
        "raw_cmi_data_keys": list((state.cmi_data or {}).keys()),
        "updated_at": state.updated_at
    }
