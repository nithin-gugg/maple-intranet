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
    db: AsyncSession = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    query = select(Course).options(selectinload(Course.category))
    if category_id:
        query = query.where(Course.category_id == category_id)
    
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/courses/{course_id}", response_model=None)
async def get_course(
    course_id: int,
    db: AsyncSession = Depends(get_db),
    # current_user = Depends(get_current_user)
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
    return result.scalars().first()

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
