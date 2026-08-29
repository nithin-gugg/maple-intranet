from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.models.core import Employee, User
from app.api.deps import get_current_user
from sqlalchemy.orm import selectinload

router = APIRouter()

@router.get("/", response_model=None)
async def get_employees(
    search: str = None,
    db: AsyncSession = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    query = select(Employee).options(
        selectinload(Employee.user),
        selectinload(Employee.department)
    )
    
    if search:
        query = query.join(User, Employee.id == User.id).where(
            (User.first_name.ilike(f"%{search}%")) |
            (User.last_name.ilike(f"%{search}%")) |
            (User.email.ilike(f"%{search}%"))
        )
        
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{employee_id}", response_model=None)
async def get_employee(
    employee_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    return result.scalars().first()
