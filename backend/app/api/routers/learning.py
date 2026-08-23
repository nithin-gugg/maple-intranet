from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.learning import Course, CourseCategory, CourseModule, LearningAttempt, CourseEnrollment, LearningPackage
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/categories", response_model=None)
async def get_course_categories(
    db: AsyncSession = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    result = await db.execute(select(CourseCategory))
    return result.scalars().all()

@router.get("/courses", response_model=None)
async def get_courses(
    category_id: int | None = None,
    user_id: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    print(f"\n[TRACE 6] GET /courses endpoint hit")
    query = select(Course).options(selectinload(Course.category))
    if category_id:
        query = query.where(Course.category_id == category_id)
    
    result = await db.execute(query)
    courses = result.scalars().all()
    
    response_data = []
    
    for c in courses:
        print(f"[TRACE 6] Course ID: {c.id}, Title: '{c.title}'")
        c_dict = {
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "category": {"id": c.category.id, "name": c.category.name} if c.category else None,
            "course_type": c.course_type,
            "progress_percent": 0,
            "status": "not attempted"
        }
        
        if user_id:
            from app.models.learning import LearningAttempt
            attempt_query = select(LearningAttempt).where(
                LearningAttempt.user_id == user_id,
                LearningAttempt.course_id == c.id
            ).order_by(LearningAttempt.attempt_number.desc())
            
            attempt_res = await db.execute(attempt_query)
            attempt = attempt_res.scalars().first()
            if attempt:
                c_dict["progress_percent"] = attempt.progress_percent or 0
                c_dict["status"] = attempt.status
                
        response_data.append(c_dict)

    return response_data

@router.get("/courses/{course_id}", response_model=None)
async def get_course(
    course_id: int,
    user_id: str | None = None,
    db: AsyncSession = Depends(get_db),
):

    result = await db.execute(
        select(Course)
        .options(
            selectinload(Course.category), 
            selectinload(Course.modules).selectinload(CourseModule.learning_package)
        )
        .where(Course.id == course_id)
    )
    course = result.scalars().first()
    
    if not course:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Course not found")
        
    c_dict = {
        "id": course.id,
        "title": course.title,
        "description": course.description,
        "category": {"id": course.category.id, "name": course.category.name} if course.category else None,
        "course_type": course.course_type,
        "modules": [
            {
                "id": m.id,
                "title": m.title,
                "content_type": m.content_type,
                "learning_package": {
                    "id": m.learning_package.id,
                    "title": m.learning_package.title,
                    "standard": m.learning_package.standard,
                    "entry_point_url": m.learning_package.entry_point_url
                } if m.learning_package else None
            } for m in course.modules
        ],
        "progress_percent": 0,
        "status": "not attempted"
    }
    
    if user_id:

        attempt_query = select(LearningAttempt).where(
            LearningAttempt.user_id == user_id,
            LearningAttempt.course_id == course_id
        ).order_by(LearningAttempt.attempt_number.desc())
        
        attempt_res = await db.execute(attempt_query)
        attempt = attempt_res.scalars().first()
        if attempt:
            c_dict["progress_percent"] = attempt.progress_percent or 0
            c_dict["status"] = attempt.status
            
    return c_dict

from pydantic import BaseModel

class MarkCompleteRequest(BaseModel):
    user_id: str

@router.post("/courses/{course_id}/complete", response_model=None)
async def mark_course_complete(
    course_id: int,
    req: MarkCompleteRequest,
    db: AsyncSession = Depends(get_db),
):
    import datetime
    
    attempt_query = select(LearningAttempt).where(
        LearningAttempt.user_id == req.user_id,
        LearningAttempt.course_id == course_id
    ).order_by(LearningAttempt.attempt_number.desc())
    
    attempt_res = await db.execute(attempt_query)
    attempt = attempt_res.scalars().first()
    
    if not attempt:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="No active attempt found for this course.")
        
    attempt.status = "completed"
    attempt.progress_percent = 100
    if not attempt.completed_at:
        attempt.completed_at = datetime.datetime.utcnow()
    attempt.last_activity_at = datetime.datetime.utcnow()
    
    await db.commit()
    return {"message": "Course marked as completed"}

from pydantic import BaseModel

class CourseCreate(BaseModel):
    title: str
    description: str | None = None
    category_id: int
    learning_package_id: int | None = None
    course_type: str = "SCORM"

@router.post("/courses", response_model=None)
async def create_course(
    course_in: CourseCreate,
    db: AsyncSession = Depends(get_db),
):
    
    course = Course(
        title=course_in.title,
        description=course_in.description,
        category_id=course_in.category_id,
        created_by="temp_admin_user", # Mock user
        is_published=True,
        course_type=course_in.course_type
    )
    db.add(course)
    await db.flush() # To get course.id

    if course_in.learning_package_id:
        module = CourseModule(
            course_id=course.id,
            title=course_in.title + " Module",
            order=1,
            content_type="SCORM",
            learning_package_id=course_in.learning_package_id
        )
        db.add(module)
    
    await db.commit()
    await db.refresh(course)
    return course

@router.delete("/courses/{course_id}", response_model=None)
async def delete_course(
    course_id: int,
    db: AsyncSession = Depends(get_db)
):
    from fastapi import HTTPException
    
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalars().first()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    await db.delete(course)
    await db.commit()
    return {"message": "Course deleted successfully"}

@router.get("/analytics/completions", response_model=None)
async def get_course_completions(
    db: AsyncSession = Depends(get_db)
):
    
    # Simple query to get all courses and their attempts
    query = (
        select(
            Course.id.label("course_id"),
            Course.title.label("course_title"),
            LearningAttempt.user_id,
            LearningAttempt.status,
            LearningAttempt.progress_percent,
            LearningAttempt.completed_at
        )
        .join(LearningAttempt, Course.id == LearningAttempt.course_id)
        .order_by(Course.id, LearningAttempt.completed_at.desc())
    )
    
    result = await db.execute(query)
    rows = result.all()
    
    analytics = []
    for row in rows:
        analytics.append({
            "course_id": row.course_id,
            "course_title": row.course_title,
            "user_id": row.user_id,
            "status": row.status,
            "progress_percent": row.progress_percent,
            "completed_at": row.completed_at.isoformat() if row.completed_at else None
        })
        
    return analytics

@router.post("/courses/{course_id}/restart", response_model=None)
async def restart_course(
    course_id: int,
    req: MarkCompleteRequest,
    db: AsyncSession = Depends(get_db)
):
    import datetime
    
    # Get course
    course_res = await db.execute(select(Course).options(selectinload(Course.modules)).where(Course.id == course_id))
    course = course_res.scalars().first()
    if not course:
        from fastapi import HTTPException
        raise HTTPException(404, "Course not found")
        
    # Get highest attempt
    attempts_query = select(LearningAttempt).where(
        LearningAttempt.user_id == req.user_id, 
        LearningAttempt.course_id == course_id
    ).order_by(LearningAttempt.attempt_number.desc())
    
    attempts_res = await db.execute(attempts_query)
    last_attempt = attempts_res.scalars().first()
    
    new_attempt_num = (last_attempt.attempt_number + 1) if last_attempt else 1
    
    # Check if SCORM or Native
    package_id = None
    standard = None
    
    if course.course_type == "SCORM":
        if course.modules and course.modules[0].learning_package_id:
            package_id = course.modules[0].learning_package_id
            package_res = await db.execute(select(LearningPackage).where(LearningPackage.id == package_id))
            pkg = package_res.scalars().first()
            if pkg:
                standard = pkg.standard
                
    new_attempt = LearningAttempt(
        user_id=req.user_id,
        course_id=course_id,
        package_id=package_id,
        standard=standard,
        attempt_number=new_attempt_num,
        status="not attempted",
        progress_percent=0
    )
    db.add(new_attempt)
    
    # Set course enrollment status to IN_PROGRESS
    enrollment_res = await db.execute(select(CourseEnrollment).where(
        CourseEnrollment.user_id == req.user_id,
        CourseEnrollment.course_id == course_id,
        CourseEnrollment.is_active == True
    ))
    enrollment = enrollment_res.scalars().first()
    if enrollment:
        enrollment.status = "IN_PROGRESS"
        enrollment.progress_percent = 0
        
    await db.commit()
    await db.refresh(new_attempt)
    return {"message": "Course restarted successfully", "attempt_id": new_attempt.id}

