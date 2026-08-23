from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.learning import Course, CourseCategory
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
    from app.models.learning import CourseModule
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
        from app.models.learning import LearningAttempt
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
    from app.models.learning import LearningAttempt
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

@router.post("/courses", response_model=None)
async def create_course(
    course_in: CourseCreate,
    db: AsyncSession = Depends(get_db),
):
    from app.models.learning import CourseModule
    
    course = Course(
        title=course_in.title,
        description=course_in.description,
        category_id=course_in.category_id,
        created_by="temp_admin_user", # Mock user
        is_published=True
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
    from app.models.learning import LearningAttempt
    
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

