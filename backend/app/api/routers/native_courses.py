from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict
import shutil
import os
import uuid

from app.core.database import get_db
from app.models.learning import Course, CourseModule, CourseLesson, LessonContentBlock, CourseResource, Quiz, QuizQuestion, QuizOption, LessonProgress, CourseEnrollment, LearningAttempt
from app.api.deps import get_current_user

router = APIRouter()

class PublishCourseUpdate(BaseModel):
    is_published: bool

# ---------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------

class ModuleCreate(BaseModel):
    title: str
    description: str | None = None
    order: int = 0

class LessonCreate(BaseModel):
    title: str
    description: str | None = None
    sort_order: int = 0
    completion_type: str = "MANUAL"
    is_required: bool = True

class ContentBlockCreate(BaseModel):
    type: str # TEXT, VIDEO, IMAGE, EMBED, RESOURCE, QUIZ
    content: str | None = None
    sort_order: int = 0
    metadata_json: dict = {}

class ContentBlockUpdate(BaseModel):
    content: str | None = None
    sort_order: int | None = None
    metadata_json: dict | None = None

# ---------------------------------------------------------
# Modules
# ---------------------------------------------------------

@router.post("/courses/{course_id}/modules", response_model=None)
async def create_module(
    course_id: int,
    module_in: ModuleCreate,
    db: AsyncSession = Depends(get_db)
):
    course_res = await db.execute(select(Course).where(Course.id == course_id))
    course = course_res.scalars().first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    module = CourseModule(
        course_id=course_id,
        title=module_in.title,
        order=module_in.order,
        content_type="NATIVE"
    )
    db.add(module)
    await db.commit()
    await db.refresh(module)
    return module

@router.put("/courses/{course_id}/publish", response_model=None)
async def publish_course(
    course_id: int,
    publish_in: PublishCourseUpdate,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Course).where(Course.id == course_id))
    course = res.scalars().first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    course.is_published = publish_in.is_published
    await db.commit()
    return {"message": "Course publish status updated", "is_published": course.is_published}

@router.put("/modules/{module_id}", response_model=None)
async def update_module(
    module_id: int,
    module_in: ModuleCreate,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(CourseModule).where(CourseModule.id == module_id))
    module = res.scalars().first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
        
    module.title = module_in.title
    module.order = module_in.order
    await db.commit()
    return module

@router.delete("/modules/{module_id}", response_model=None)
async def delete_module(
    module_id: int,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(CourseModule).where(CourseModule.id == module_id))
    module = res.scalars().first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
        
    await db.delete(module)
    await db.commit()
    return {"message": "Module deleted"}

# ---------------------------------------------------------
# Lessons
# ---------------------------------------------------------

@router.post("/modules/{module_id}/lessons", response_model=None)
async def create_lesson(
    module_id: int,
    lesson_in: LessonCreate,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(CourseModule).where(CourseModule.id == module_id))
    module = res.scalars().first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
        
    lesson = CourseLesson(
        module_id=module_id,
        title=lesson_in.title,
        description=lesson_in.description,
        sort_order=lesson_in.sort_order,
        completion_type=lesson_in.completion_type,
        is_required=lesson_in.is_required
    )
    db.add(lesson)
    await db.commit()
    await db.refresh(lesson)
    return lesson

@router.put("/lessons/{lesson_id}", response_model=None)
async def update_lesson(
    lesson_id: int,
    lesson_in: LessonCreate,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(CourseLesson).where(CourseLesson.id == lesson_id))
    lesson = res.scalars().first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
        
    lesson.title = lesson_in.title
    lesson.description = lesson_in.description
    lesson.sort_order = lesson_in.sort_order
    lesson.completion_type = lesson_in.completion_type
    lesson.is_required = lesson_in.is_required
    await db.commit()
    return lesson

@router.delete("/lessons/{lesson_id}", response_model=None)
async def delete_lesson(
    lesson_id: int,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(CourseLesson).where(CourseLesson.id == lesson_id))
    lesson = res.scalars().first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
        
    await db.delete(lesson)
    await db.commit()
    return {"message": "Lesson deleted"}

# ---------------------------------------------------------
# Content Blocks
# ---------------------------------------------------------

@router.post("/lessons/{lesson_id}/content", response_model=None)
async def create_content_block(
    lesson_id: int,
    block_in: ContentBlockCreate,
    db: AsyncSession = Depends(get_db)
):
    block = LessonContentBlock(
        lesson_id=lesson_id,
        type=block_in.type,
        content=block_in.content,
        sort_order=block_in.sort_order,
        metadata_json=block_in.metadata_json
    )
    db.add(block)
    await db.commit()
    await db.refresh(block)
    return block

@router.put("/content/{block_id}", response_model=None)
async def update_content_block(
    block_id: int,
    block_in: ContentBlockUpdate,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(LessonContentBlock).where(LessonContentBlock.id == block_id))
    block = res.scalars().first()
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")
        
    if block_in.content is not None:
        block.content = block_in.content
    if block_in.sort_order is not None:
        block.sort_order = block_in.sort_order
    if block_in.metadata_json is not None:
        block.metadata_json = block_in.metadata_json
        
    await db.commit()
    return block

@router.delete("/content/{block_id}", response_model=None)
async def delete_content_block(
    block_id: int,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(LessonContentBlock).where(LessonContentBlock.id == block_id))
    block = res.scalars().first()
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")
        
    await db.delete(block)
    await db.commit()
    return {"message": "Block deleted"}

# ---------------------------------------------------------
# File Uploads (Images/Resources)
# ---------------------------------------------------------

UPLOAD_DIR = "static/native_courses"

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_ext = os.path.splitext(file.filename)[1] if file.filename else ""
    new_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, new_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"url": f"/static/native_courses/{new_filename}", "filename": file.filename}

# ---------------------------------------------------------
# Get Course Full Hierarchy
# ---------------------------------------------------------

@router.get("/courses/{course_id}/hierarchy", response_model=None)
async def get_course_hierarchy(
    course_id: int,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Course)
        .options(
            selectinload(Course.modules)
            .selectinload(CourseModule.lessons)
            .selectinload(CourseLesson.content_blocks)
        )
        .where(Course.id == course_id)
    )
    course = res.scalars().first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    return {
        "id": course.id,
        "title": course.title,
        "course_type": course.course_type,
        "is_published": course.is_published,
        "modules": [
            {
                "id": m.id,
                "title": m.title,
                "order": m.order,
                "lessons": [
                    {
                        "id": l.id,
                        "title": l.title,
                        "sort_order": l.sort_order,
                        "content_blocks": [
                            {
                                "id": b.id,
                                "type": b.type,
                                "content": b.content,
                                "sort_order": b.sort_order,
                                "metadata_json": b.metadata_json
                            } for b in sorted(l.content_blocks, key=lambda x: x.sort_order)
                        ]
                    } for l in sorted(m.lessons, key=lambda x: x.sort_order)
                ]
            } for m in sorted(course.modules, key=lambda x: x.order)
        ]
    }

# ---------------------------------------------------------
# Progress Tracking
# ---------------------------------------------------------

@router.get("/courses/{course_id}/progress", response_model=None)
async def get_course_progress(
    course_id: int,
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    from app.models.learning import LearningAttempt
    
    # Get latest attempt
    attempt_res = await db.execute(select(LearningAttempt).where(
        LearningAttempt.user_id == user_id,
        LearningAttempt.course_id == course_id
    ).order_by(LearningAttempt.attempt_number.desc()))
    attempt = attempt_res.scalars().first()
    
    if attempt:
        res = await db.execute(select(LessonProgress).where(
            LessonProgress.course_id == course_id,
            LessonProgress.user_id == user_id,
            (LessonProgress.attempt_id == attempt.id) | (LessonProgress.attempt_id == None)
        ))
    else:
        res = await db.execute(select(LessonProgress).where(
            LessonProgress.course_id == course_id,
            LessonProgress.user_id == user_id,
            LessonProgress.attempt_id == None
        ))
        
    progresses = res.scalars().all()
    completed_lesson_ids = [p.lesson_id for p in progresses if p.status == "COMPLETED"]

    enrollment_res = await db.execute(select(CourseEnrollment).where(
        CourseEnrollment.course_id == course_id,
        CourseEnrollment.user_id == user_id,
        CourseEnrollment.is_active == True
    ))
    enrollment = enrollment_res.scalars().first()
    
    return {
        "completed_lesson_ids": completed_lesson_ids,
        "progress_percent": enrollment.progress_percent if enrollment else (attempt.progress_percent if attempt else 0),
        "status": enrollment.status if enrollment else (attempt.status if attempt else "NOT_STARTED")
    }

class CompleteLessonRequest(BaseModel):
    user_id: str

@router.post("/courses/{course_id}/lessons/{lesson_id}/complete", response_model=None)
async def complete_lesson(
    course_id: int,
    lesson_id: int,
    req: CompleteLessonRequest,
    db: AsyncSession = Depends(get_db)
):
    import datetime
    from app.models.learning import LearningAttempt
    
    # Get active attempt
    attempt_res = await db.execute(select(LearningAttempt).where(
        LearningAttempt.user_id == req.user_id,
        LearningAttempt.course_id == course_id
    ).order_by(LearningAttempt.attempt_number.desc()))
    attempt = attempt_res.scalars().first()
    
    # Create one if missing for backwards compatibility
    if not attempt:
        attempt = LearningAttempt(
            user_id=req.user_id, course_id=course_id, attempt_number=1, standard="NATIVE", status="IN_PROGRESS"
        )
        db.add(attempt)
        await db.flush()
    
    # 1. Update or create LessonProgress tied to attempt
    res = await db.execute(select(LessonProgress).where(
        LessonProgress.course_id == course_id,
        LessonProgress.lesson_id == lesson_id,
        LessonProgress.user_id == req.user_id,
        (LessonProgress.attempt_id == attempt.id) | (LessonProgress.attempt_id == None)
    ))
    lesson_prog = res.scalars().first()
    if not lesson_prog:
        lesson_prog = LessonProgress(
            user_id=req.user_id,
            course_id=course_id,
            lesson_id=lesson_id,
            attempt_id=attempt.id,
            status="COMPLETED",
            progress_percentage=100,
            completed_at=datetime.datetime.utcnow()
        )
        db.add(lesson_prog)
    else:
        lesson_prog.attempt_id = attempt.id # upgrade it
        lesson_prog.status = "COMPLETED"
        lesson_prog.progress_percentage = 100
        if not lesson_prog.completed_at:
            lesson_prog.completed_at = datetime.datetime.utcnow()
            
    await db.flush()

    # 2. Recalculate CourseEnrollment progress
    modules_res = await db.execute(
        select(CourseModule)
        .options(selectinload(CourseModule.lessons))
        .where(CourseModule.course_id == course_id)
    )
    modules = modules_res.scalars().all()
    all_required_lessons = []
    for m in modules:
        for l in m.lessons:
            if l.is_required:
                all_required_lessons.append(l.id)
                
    total_required = len(all_required_lessons)
    
    comp_res = await db.execute(select(LessonProgress).where(
        LessonProgress.course_id == course_id,
        LessonProgress.user_id == req.user_id,
        LessonProgress.status == "COMPLETED",
        (LessonProgress.attempt_id == attempt.id) | (LessonProgress.attempt_id == None)
    ))
    completed_progs = comp_res.scalars().all()
    completed_required_count = len([p for p in completed_progs if p.lesson_id in all_required_lessons])
    
    new_progress = int((completed_required_count / total_required * 100)) if total_required > 0 else 100
    new_status = "COMPLETED" if new_progress >= 100 else "IN_PROGRESS"
    
    # Update or create CourseEnrollment
    enroll_res = await db.execute(select(CourseEnrollment).where(
        CourseEnrollment.course_id == course_id,
        CourseEnrollment.user_id == req.user_id,
        CourseEnrollment.is_active == True
    ))
    enrollment = enroll_res.scalars().first()
    
    if not enrollment:
        enrollment = CourseEnrollment(
            course_id=course_id,
            user_id=req.user_id,
            status=new_status,
            progress_percent=new_progress,
            completed_at=datetime.datetime.utcnow() if new_status == "COMPLETED" else None
        )
        db.add(enrollment)
    else:
        enrollment.progress_percent = new_progress
        if new_status == "COMPLETED" and enrollment.status != "COMPLETED":
            enrollment.completed_at = datetime.datetime.utcnow()
        enrollment.status = new_status
        
    # Also update LearningAttempt to ensure dashboard works seamlessly
    attempt_res = await db.execute(select(LearningAttempt).where(
        LearningAttempt.user_id == req.user_id,
        LearningAttempt.course_id == course_id
    ).order_by(LearningAttempt.attempt_number.desc()))
    attempt = attempt_res.scalars().first()
    
    if attempt:
        attempt.progress_percent = new_progress
        attempt.status = "completed" if new_progress >= 100 else "incomplete"
        if new_progress >= 100 and not attempt.completed_at:
            attempt.completed_at = datetime.datetime.utcnow()
        attempt.last_activity_at = datetime.datetime.utcnow()

    await db.commit()
    return {"message": "Lesson completed", "progress": new_progress, "status": new_status, "completed_lesson_ids": [p.lesson_id for p in completed_progs]}
