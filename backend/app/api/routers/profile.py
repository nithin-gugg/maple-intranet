from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Any, List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.models.core import User, Employee, Department, Role
from app.api.deps import get_current_user_id

router = APIRouter()

class ProfileSyncResponse(BaseModel):
    user_id: str
    first_name: str
    last_name: str
    email: str
    onboarding_completed: bool
    onboarding_step: int
    employee_id: Optional[str]
    designation: Optional[str]
    department_id: Optional[int]
    date_of_birth: Optional[datetime]
    joining_date: Optional[datetime]
    roles: List[str]

class OnboardingStepData(BaseModel):
    step: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    employee_id: Optional[str] = None
    role_name: Optional[str] = None
    department_id: Optional[int] = None
    designation: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    joining_date: Optional[datetime] = None

@router.get("/sync", response_model=ProfileSyncResponse)
async def sync_profile(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Syncs the Clerk user with the local DB.
    If the user doesn't exist, creates a stub user and employee record.
    Returns the current onboarding state.
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    if not user:
        # Create minimal stub. In a real app we might decode the JWT to get email,
        # but since we just need the relation, we'll create it with empty strings 
        # for required fields until onboarding updates them.
        user = User(
            id=user_id,
            email=f"{user_id}@placeholder.com",  # Should ideally be extracted from JWT or Clerk webhook
            first_name="",
            last_name=""
        )
        db.add(user)
        
        employee = Employee(
            id=user_id,
            designation="",
            onboarding_completed=False,
            onboarding_step=1
        )
        db.add(employee)
        await db.commit()
        await db.refresh(user)
        await db.refresh(employee)
    else:
        # User exists, get employee
        result_emp = await db.execute(select(Employee).where(Employee.id == user_id))
        employee = result_emp.scalars().first()
        if not employee:
            employee = Employee(
                id=user_id,
                designation="",
                onboarding_completed=False,
                onboarding_step=1
            )
            db.add(employee)
            await db.commit()
            await db.refresh(employee)
            
    # Get user roles
    roles = []
    # roles could be fetched here if needed, but for simplicity we will just return empty or default

    return {
        "user_id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "onboarding_completed": employee.onboarding_completed,
        "onboarding_step": employee.onboarding_step,
        "employee_id": employee.employee_id,
        "designation": employee.designation,
        "department_id": employee.department_id,
        "date_of_birth": employee.date_of_birth,
        "joining_date": employee.joining_date,
        "roles": roles
    }

@router.patch("/onboarding")
async def save_onboarding_step(
    data: OnboardingStepData,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    result_emp = await db.execute(select(Employee).where(Employee.id == user_id))
    employee = result_emp.scalars().first()
    
    if not user or not employee:
        raise HTTPException(status_code=404, detail="User not found")
        
    if data.first_name is not None:
        user.first_name = data.first_name
    if data.last_name is not None:
        user.last_name = data.last_name
        
    if data.employee_id is not None:
        employee.employee_id = data.employee_id
    if data.designation is not None:
        employee.designation = data.designation
    if data.department_id is not None:
        employee.department_id = data.department_id
    if data.date_of_birth is not None:
        employee.date_of_birth = data.date_of_birth
    if data.joining_date is not None:
        employee.joining_date = data.joining_date
        
    # We don't save roles directly here in MVP, but you could lookup the role_name and associate it
    
    employee.onboarding_step = data.step
    await db.commit()
    
    return {"status": "success"}

@router.post("/onboarding/complete")
async def complete_onboarding(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
) -> Any:
    from app.core.config import settings
    import httpx
    import datetime
    
    result_emp = await db.execute(select(Employee).where(Employee.id == user_id))
    employee = result_emp.scalars().first()
    
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
        
    employee.onboarding_completed = True
    employee.onboarding_completed_at = datetime.datetime.utcnow()
    await db.commit()
    
    # Update Clerk Metadata
    if settings.CLERK_SECRET_KEY:
        async with httpx.AsyncClient() as client:
            try:
                res = await client.patch(
                    f"https://api.clerk.com/v1/users/{user_id}/metadata",
                    headers={
                        "Authorization": f"Bearer {settings.CLERK_SECRET_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={"public_metadata": {"onboarding_completed": True}}
                )
                res.raise_for_status()
            except Exception as e:
                print(f"Error updating Clerk metadata: {e}")
                
    return {"status": "success"}
