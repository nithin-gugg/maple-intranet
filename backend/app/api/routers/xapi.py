from fastapi import APIRouter, Depends, HTTPException, Body, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, Any, List, Union
import logging

from app.core.database import get_db
from app.learning.services.lrs_service import NativeLRSService
from app.learning.standards.cmi5.validation import Cmi5Validator
from app.models.learning import XApiState, XApiProfile

router = APIRouter()

@router.post("/statements")
async def post_statement(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    import json
    
    # Handle xAPI Alternate Request Syntax (form-encoded POST with method=PUT/POST)
    content_type = request.headers.get("content-type", "")
    method_param = request.query_params.get("method")
    
    statements = []
    
    if "application/json" in content_type:
        body = await request.json()
        statements = body if isinstance(body, list) else [body]
    elif "application/x-www-form-urlencoded" in content_type or "multipart/form-data" in content_type:
        form = await request.form()
        # The statement could be in 'statement' or 'content'
        statement_str = form.get("statement") or form.get("content")
        if statement_str:
            body = json.loads(statement_str)
            statements = body if isinstance(body, list) else [body]
    else:
        # Fallback to reading raw body and parsing
        body_bytes = await request.body()
        if body_bytes:
            body = json.loads(body_bytes)
            statements = body if isinstance(body, list) else [body]

    if not statements:
        raise HTTPException(status_code=400, detail="No valid statements found in request")

    # 1. Validation
    for stmt in statements:
        if "actor" not in stmt or "verb" not in stmt or "object" not in stmt:
            raise HTTPException(status_code=400, detail="Invalid xAPI statement: missing actor, verb, or object")

    # 2. Diagnostic Logging
    verbs = [stmt.get("verb", {}).get("id", "").split("/")[-1] for stmt in statements]
    registration_id = statements[0].get("context", {}).get("registration") if statements else None
    activity_id = statements[0].get("object", {}).get("id") if statements else None
    
    logging.info(f"[xAPI] Received {len(statements)} statements.")
    logging.info(f"[xAPI] Verbs: {verbs}")
    logging.info(f"[xAPI] Registration: {registration_id}")
    logging.info(f"[xAPI] Activity ID: {activity_id}")

    # 3. LRS Storage (Standard-Agnostic)
    lrs_service = NativeLRSService(db)
    statement_ids = []
    try:
        for stmt in statements:
            stmt_id = await lrs_service.store_statement(stmt)
            statement_ids.append(stmt_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # 4. Standard-Specific Completion Dispatch
    auth_header = request.headers.get("Authorization")
    is_cmi5 = False
    
    if auth_header:
        logging.info("[xAPI] Auth header detected. Trying Cmi5Validator.")
        try:
            await Cmi5Validator.process_statements(statements, db, auth_header)
            is_cmi5 = True
        except HTTPException as e:
            if e.status_code == 401:
                logging.info("[xAPI] Not a CMI5 session, falling back to standard xAPI processing.")
            else:
                raise e

    if not is_cmi5:
        logging.info("[xAPI] Processing pure xAPI completion.")
        from app.learning.standards.xapi.adapter import XApiAdapter
        await XApiAdapter.process_statements(statements, db)
        await db.commit()
            
    return statement_ids # xAPI 1.0.3 specification returns an array of statement IDs

@router.put("/statements")
async def put_statement(
    statementId: str,
    request: Request,
    statement: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db)
):
    statement["id"] = statementId
    
    lrs_service = NativeLRSService(db)
    try:
        await lrs_service.store_statement(statement)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    auth_header = request.headers.get("Authorization")
    is_cmi5 = False
    
    if auth_header:
        try:
            await Cmi5Validator.process_statements([statement], db, auth_header)
            is_cmi5 = True
        except HTTPException as e:
            if e.status_code == 401:
                # Not a valid CMI5 session, fallback to standard xAPI
                logging.info("[xAPI] Not a CMI5 session (or expired), falling back to standard xAPI processing.")
            else:
                raise e
                
    if not is_cmi5:
        from app.learning.standards.xapi.adapter import XApiAdapter
        await XApiAdapter.process_statements([statement], db)
        await db.commit()
        
    return "", 204

@router.get("/statements")
async def get_statements(db: AsyncSession = Depends(get_db)):
    lrs_service = NativeLRSService(db)
    statements = await lrs_service.get_statements()
    return {"statements": statements}

@router.get("/agents/profile")
@router.get("/statements/agents/profile")
async def get_agent_profile(agent: str, profileId: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(XApiProfile).where(XApiProfile.agent_id == agent).where(XApiProfile.profile_id == profileId)
    )
    profile = result.scalars().first()
    if profile:
        return profile.profile_data
    raise HTTPException(status_code=404, detail="Profile not found")

@router.put("/agents/profile")
@router.put("/statements/agents/profile")
async def put_agent_profile(agent: str, profileId: str, request: Request, db: AsyncSession = Depends(get_db)):
    try:
        data = await request.json()
    except:
        data = (await request.body()).decode('utf-8')
        
    result = await db.execute(
        select(XApiProfile).where(XApiProfile.agent_id == agent).where(XApiProfile.profile_id == profileId)
    )
    profile = result.scalars().first()
    if profile:
        profile.profile_data = data
    else:
        profile = XApiProfile(agent_id=agent, profile_id=profileId, profile_data=data)
        db.add(profile)
    await db.commit()
    return "", 204

@router.post("/agents/profile")
@router.post("/statements/agents/profile")
async def post_agent_profile(agent: str, profileId: str, request: Request, db: AsyncSession = Depends(get_db)):
    try:
        new_data = await request.json()
    except:
        new_data = (await request.body()).decode('utf-8')
        
    result = await db.execute(
        select(XApiProfile).where(XApiProfile.agent_id == agent).where(XApiProfile.profile_id == profileId)
    )
    profile = result.scalars().first()
    
    if profile and isinstance(profile.profile_data, dict) and isinstance(new_data, dict):
        # Merge dicts
        merged = dict(profile.profile_data)
        merged.update(new_data)
        profile.profile_data = merged
    elif profile:
        profile.profile_data = new_data
    else:
        profile = XApiProfile(agent_id=agent, profile_id=profileId, profile_data=new_data)
        db.add(profile)
        
    await db.commit()
    return "", 204

@router.get("/activities")
@router.get("/statements/activities")
async def get_activity(activityId: str):
    # Stub for standard xAPI Activity API
    return {
        "id": activityId,
        "definition": {
            "name": {"en-US": "Course Activity"},
            "description": {"en-US": "A course activity."}
        }
    }

@router.get("/activities/state")
@router.get("/statements/activities/state")
async def get_activity_state(
    stateId: str,
    activityId: str,
    agent: str,
    registration: str = None,
    db: AsyncSession = Depends(get_db)
):
    import json
    try:
        agent_obj = json.loads(agent)
        agent_normalized = json.dumps(agent_obj, sort_keys=True)
    except:
        agent_normalized = agent

    query = select(XApiState).where(XApiState.activity_id == activityId).where(XApiState.agent_id == agent_normalized).where(XApiState.state_id == stateId)
    if registration:
        query = query.where(XApiState.registration == registration)
    else:
        query = query.where(XApiState.registration.is_(None))
        
    result = await db.execute(query)
    state = result.scalars().first()
    
    if state:
        from fastapi.responses import Response
        if isinstance(state.state_data, str):
            return Response(content=state.state_data, media_type="application/json")
        return state.state_data
        
    # cmi5 requires LMS.LaunchData to be pre-populated by the LMS
    if stateId == "LMS.LaunchData":
        return {
            "launchMode": "Normal",
            "launchParameters": "",
            "entitlementKey": {
                "courseStructure": "",
                "alternate": ""
            },
            "contextTemplate": {
                "contextActivities": {
                    "grouping": [{"id": activityId}]
                }
            }
        }
        
    # If not found, xAPI spec requires a 404 for state
    raise HTTPException(status_code=404, detail="State not found")

@router.put("/activities/state")
@router.put("/statements/activities/state")
async def put_activity_state(
    stateId: str,
    activityId: str,
    agent: str,
    request: Request,
    registration: str = None,
    db: AsyncSession = Depends(get_db)
):
    import json
    try:
        agent_obj = json.loads(agent)
        agent_normalized = json.dumps(agent_obj, sort_keys=True)
    except:
        agent_normalized = agent
        
    try:
        data = await request.json()
    except:
        data = (await request.body()).decode('utf-8')
        
    query = select(XApiState).where(XApiState.activity_id == activityId).where(XApiState.agent_id == agent_normalized).where(XApiState.state_id == stateId)
    if registration:
        query = query.where(XApiState.registration == registration)
    else:
        query = query.where(XApiState.registration.is_(None))
        
    result = await db.execute(query)
    state = result.scalars().first()
    
    if state:
        state.state_data = data
    else:
        state = XApiState(activity_id=activityId, agent_id=agent_normalized, registration=registration, state_id=stateId, state_data=data)
        db.add(state)
        
    await db.commit()
    return "", 204

@router.post("/activities/state")
@router.post("/statements/activities/state")
async def post_activity_state(
    request: Request,
    stateId: str = None,
    activityId: str = None,
    agent: str = None,
    registration: str = None,
    db: AsyncSession = Depends(get_db)
):
    import json
    content_type = request.headers.get("content-type", "")
    
    # In Alternate Request Syntax, parameters are in the form body
    if "application/x-www-form-urlencoded" in content_type or "multipart/form-data" in content_type:
        form = await request.form()
        stateId = stateId or form.get("stateId")
        activityId = activityId or form.get("activityId")
        agent = agent or form.get("agent")
        registration = registration or form.get("registration")
        content = form.get("content")
        try:
            new_data = json.loads(content) if content else {}
        except:
            new_data = content
    else:
        try:
            new_data = await request.json()
        except:
            new_data = (await request.body()).decode('utf-8')
            
    if not stateId or not activityId or not agent:
        raise HTTPException(status_code=400, detail="Missing required parameters (stateId, activityId, agent)")
        
    try:
        agent_obj = json.loads(agent)
        agent_normalized = json.dumps(agent_obj, sort_keys=True)
    except:
        agent_normalized = agent
        
    query = select(XApiState).where(XApiState.activity_id == activityId).where(XApiState.agent_id == agent_normalized).where(XApiState.state_id == stateId)
    if registration:
        query = query.where(XApiState.registration == registration)
    else:
        query = query.where(XApiState.registration.is_(None))
        
    result = await db.execute(query)
    state = result.scalars().first()
    
    if state and isinstance(state.state_data, dict) and isinstance(new_data, dict):
        merged = dict(state.state_data)
        merged.update(new_data)
        state.state_data = merged
    elif state:
        state.state_data = new_data
    else:
        state = XApiState(activity_id=activityId, agent_id=agent_normalized, registration=registration, state_id=stateId, state_data=new_data)
        db.add(state)
        
    await db.commit()
    return "", 204

@router.delete("/activities/state")
@router.delete("/statements/activities/state")
async def delete_activity_state(
    stateId: str,
    activityId: str,
    agent: str,
    registration: str = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(XApiState).where(XApiState.activity_id == activityId).where(XApiState.agent_id == agent).where(XApiState.state_id == stateId)
    if registration:
        query = query.where(XApiState.registration == registration)
    else:
        query = query.where(XApiState.registration.is_(None))
        
    result = await db.execute(query)
    state = result.scalars().first()
    if state:
        await db.delete(state)
        await db.commit()
    return "", 204
