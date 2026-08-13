from fastapi import APIRouter, Depends, HTTPException, Body, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List

from app.core.database import get_db
from app.learning.services.lrs_service import NativeLRSService

router = APIRouter()

@router.post("/statements")
async def post_statement(
    request: Request,
    statement: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db)
):
    # Basic validation
    if "actor" not in statement or "verb" not in statement or "object" not in statement:
        raise HTTPException(status_code=400, detail="Invalid xAPI statement: missing actor, verb, or object")

    lrs_service = NativeLRSService(db)
    try:
        statement_id = await lrs_service.store_statement(statement)
        return [statement_id] # xAPI 1.0.3 specification returns an array of statement IDs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/statements")
async def put_statement(
    statementId: str,
    statement: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db)
):
    statement["id"] = statementId
    lrs_service = NativeLRSService(db)
    try:
        await lrs_service.store_statement(statement)
        return "", 204
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/statements")
async def get_statements(db: AsyncSession = Depends(get_db)):
    lrs_service = NativeLRSService(db)
    statements = await lrs_service.get_statements()
    return {"statements": statements}
