from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.models.core import User, Employee, Department
from app.models.learning import Course, CourseEnrollment, LearningAttempt, LessonProgress, QuizAttempt
from app.api.deps import get_current_user
from sqlalchemy.orm import selectinload

router = APIRouter()

class AssignRequest(BaseModel):
    course_id: int
    user_ids: List[str] = []
    department_id: Optional[int] = None
    due_date: Optional[datetime] = None

@router.get("/users")
async def get_users_with_assignments(db: AsyncSession = Depends(get_db)):
    """Get all employees with their active assignment count."""
    query = select(Employee).options(
        selectinload(Employee.user),
        selectinload(Employee.department)
    )
    result = await db.execute(query)
    employees = result.scalars().all()
    
    # Get assignment counts
    counts_query = select(CourseEnrollment.user_id, func.count(CourseEnrollment.id)).where(
        CourseEnrollment.is_active == True
    ).group_by(CourseEnrollment.user_id)
    
    counts_result = await db.execute(counts_query)
    counts = {row[0]: row[1] for row in counts_result.all()}
    
    response = []
    for emp in employees:
        emp_dict = {
            "id": emp.id,
            "employee_id": emp.employee_id,
            "name": f"{emp.user.first_name} {emp.user.last_name}" if emp.user else "Unknown",
            "email": emp.user.email if emp.user else "",
            "department": emp.department.name if emp.department else "None",
            "assigned_courses": counts.get(emp.id, 0)
        }
        response.append(emp_dict)
        
    return response

@router.get("/users/{user_id}")
async def get_user_assignments(user_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific user's assignments and history."""
    
    # 1. Get assignments
    enrollments_query = select(CourseEnrollment).options(
        selectinload(CourseEnrollment.course)
    ).where(
        CourseEnrollment.user_id == user_id,
        CourseEnrollment.is_active == True
    ).order_by(desc(CourseEnrollment.enrolled_at))
    
    enrollments_result = await db.execute(enrollments_query)
    enrollments = enrollments_result.scalars().all()
    
    # 2. Get history (attempts)
    attempts_query = select(LearningAttempt).options(
        selectinload(LearningAttempt.course)
    ).where(
        LearningAttempt.user_id == user_id
    ).order_by(desc(LearningAttempt.started_at))
    
    attempts_result = await db.execute(attempts_query)
    attempts = attempts_result.scalars().all()
    
    return {
        "assignments": [
            {
                "id": e.id,
                "course_id": e.course_id,
                "course_title": e.course.title if e.course else "Unknown",
                "course_type": e.course.course_type if e.course else "SCORM",
                "status": e.status,
                "progress_percent": e.progress_percent,
                "assigned_at": e.enrolled_at,
                "due_date": e.due_date
            } for e in enrollments
        ],
        "history": [
            {
                "id": a.id,
                "course_id": a.course_id,
                "course_title": a.course.title if a.course else "Unknown",
                "attempt_number": a.attempt_number,
                "status": a.status,
                "progress_percent": a.progress_percent,
                "started_at": a.started_at,
                "completed_at": a.completed_at
            } for a in attempts
        ]
    }

@router.post("/")
async def assign_courses(req: AssignRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Assign a course to users or a department."""
    target_users = set(req.user_ids)
    
    if req.department_id:
        dept_users_query = select(Employee.id).where(Employee.department_id == req.department_id)
        dept_result = await db.execute(dept_users_query)
        target_users.update(row[0] for row in dept_result.all())
        
    if not target_users:
        raise HTTPException(status_code=400, detail="No users selected for assignment.")
        
    course = await db.execute(select(Course).where(Course.id == req.course_id))
    if not course.scalars().first():
        raise HTTPException(status_code=404, detail="Course not found.")
        
    assigned_count = 0
    for uid in target_users:
        # Check if already assigned and active
        existing_query = select(CourseEnrollment).where(
            CourseEnrollment.user_id == uid,
            CourseEnrollment.course_id == req.course_id,
            CourseEnrollment.is_active == True
        )
        existing = await db.execute(existing_query)
        if existing.scalars().first():
            continue
            
        # Create assignment
        new_assignment = CourseEnrollment(
            user_id=uid,
            course_id=req.course_id,
            status="ENROLLED",
            assigned_by=current_user.id if current_user else "System",
            due_date=req.due_date,
            is_active=True
        )
        db.add(new_assignment)
        assigned_count += 1
        
    await db.commit()
    return {"message": f"Successfully assigned to {assigned_count} users.", "assigned_count": assigned_count}

@router.post("/{assignment_id}/unassign")
async def unassign_course(assignment_id: int, db: AsyncSession = Depends(get_db)):
    """Soft delete an assignment."""
    query = select(CourseEnrollment).where(CourseEnrollment.id == assignment_id)
    result = await db.execute(query)
    assignment = result.scalars().first()
    
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
        
    assignment.is_active = False
    await db.commit()
    return {"message": "Assignment deactivated."}
