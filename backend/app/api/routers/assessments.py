from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional, Any
from pydantic import BaseModel
import datetime

from app.core.database import get_db
from app.models.assessment import Assessment, AssessmentQuestion, AssessmentOption, AssessmentAttempt, AssessmentAnswer
from app.api.deps import get_current_user

router = APIRouter()

# ---------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------

class OptionCreate(BaseModel):
    option_text: str
    is_correct: bool
    sort_order: int = 0

class QuestionCreate(BaseModel):
    question_type: str
    question_text: str
    explanation: Optional[str] = None
    marks: int = 10
    sort_order: int = 0
    options: List[OptionCreate] = []

class AssessmentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    instructions: Optional[str] = None
    passing_score: int = 70
    time_limit_minutes: Optional[int] = None
    attempts_allowed: Optional[int] = None
    status: str = "Draft"
    questions: List[QuestionCreate] = []

class AnswerSubmit(BaseModel):
    question_id: int
    answer_text: Optional[str] = None
    selected_option_ids: Optional[List[int]] = None

class AssessmentSubmitRequest(BaseModel):
    answers: List[AnswerSubmit]

# ---------------------------------------------------------
# Admin Endpoints
# ---------------------------------------------------------

@router.get("/")
async def list_assessments(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Assessment).order_by(Assessment.created_at.desc()))
    return res.scalars().all()

@router.get("/{assessment_id}")
async def get_assessment(assessment_id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(Assessment)
        .options(
            selectinload(Assessment.questions).selectinload(AssessmentQuestion.options)
        )
        .where(Assessment.id == assessment_id)
    )
    assessment = res.scalars().first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
        
    return assessment

@router.post("/")
async def create_assessment(
    data: AssessmentCreate,
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    assessment = Assessment(
        title=data.title,
        description=data.description,
        instructions=data.instructions,
        passing_score=data.passing_score,
        time_limit_minutes=data.time_limit_minutes,
        attempts_allowed=data.attempts_allowed,
        status=data.status,
        created_by=user.id
    )
    db.add(assessment)
    await db.flush()
    
    for q_data in data.questions:
        q = AssessmentQuestion(
            assessment_id=assessment.id,
            question_type=q_data.question_type,
            question_text=q_data.question_text,
            explanation=q_data.explanation,
            marks=q_data.marks,
            sort_order=q_data.sort_order
        )
        db.add(q)
        await db.flush()
        
        for o_data in q_data.options:
            o = AssessmentOption(
                question_id=q.id,
                option_text=o_data.option_text,
                is_correct=o_data.is_correct,
                sort_order=o_data.sort_order
            )
            db.add(o)
            
    await db.commit()
    await db.refresh(assessment)
    return assessment

@router.delete("/{assessment_id}")
async def delete_assessment(assessment_id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Assessment).where(Assessment.id == assessment_id))
    assessment = res.scalars().first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
        
    await db.delete(assessment)
    await db.commit()
    return {"message": "Assessment deleted"}

# ---------------------------------------------------------
# Employee Endpoints
# ---------------------------------------------------------

@router.post("/{assessment_id}/attempt")
async def start_attempt(
    assessment_id: int,
    course_id: int,
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Assessment).where(Assessment.id == assessment_id))
    assessment = res.scalars().first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
        
    # Check attempt limits
    if assessment.attempts_allowed:
        count_res = await db.execute(
            select(AssessmentAttempt)
            .where(AssessmentAttempt.assessment_id == assessment_id, AssessmentAttempt.user_id == user.id)
        )
        attempts = count_res.scalars().all()
        if len(attempts) >= assessment.attempts_allowed:
            raise HTTPException(status_code=400, detail="Maximum attempts reached")
            
    # Count previous to get next attempt number
    count_res = await db.execute(
        select(AssessmentAttempt)
        .where(AssessmentAttempt.assessment_id == assessment_id, AssessmentAttempt.user_id == user.id)
    )
    attempt_number = len(count_res.scalars().all()) + 1
            
    attempt = AssessmentAttempt(
        assessment_id=assessment_id,
        user_id=user.id,
        course_id=course_id,
        attempt_number=attempt_number,
        status="IN_PROGRESS"
    )
    db.add(attempt)
    await db.commit()
    await db.refresh(attempt)
    return attempt

@router.post("/{assessment_id}/attempts/{attempt_id}/submit")
async def submit_attempt(
    assessment_id: int,
    attempt_id: int,
    submission: AssessmentSubmitRequest,
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(AssessmentAttempt)
        .where(AssessmentAttempt.id == attempt_id, AssessmentAttempt.user_id == user.id)
    )
    attempt = res.scalars().first()
    if not attempt or attempt.status != "IN_PROGRESS":
        raise HTTPException(status_code=400, detail="Invalid attempt or already submitted")
        
    ass_res = await db.execute(
        select(Assessment)
        .options(selectinload(Assessment.questions).selectinload(AssessmentQuestion.options))
        .where(Assessment.id == assessment_id)
    )
    assessment = ass_res.scalars().first()
    
    total_marks = 0
    earned_marks = 0
    needs_manual_grading = False
    
    question_map = {q.id: q for q in assessment.questions}
    
    for ans in submission.answers:
        q = question_map.get(ans.question_id)
        if not q:
            continue
            
        total_marks += q.marks
        is_correct = False
        marks_awarded = 0
        
        if q.question_type in ["MULTIPLE_CHOICE", "MULTIPLE_ANSWER", "TRUE_FALSE"]:
            correct_option_ids = set([o.id for o in q.options if o.is_correct])
            selected_ids = set(ans.selected_option_ids or [])
            
            if correct_option_ids == selected_ids:
                is_correct = True
                marks_awarded = q.marks
                
        elif q.question_type == "SHORT_ANSWER":
            # Very basic check, normally needs more robust handling
            correct_texts = [o.option_text.lower().strip() for o in q.options if o.is_correct]
            user_text = (ans.answer_text or "").lower().strip()
            if user_text in correct_texts:
                is_correct = True
                marks_awarded = q.marks
                
        elif q.question_type == "PARAGRAPH":
            needs_manual_grading = True
            is_correct = None
            marks_awarded = 0 # Admin will assign later
            
        earned_marks += marks_awarded
        
        db_answer = AssessmentAnswer(
            attempt_id=attempt.id,
            question_id=q.id,
            answer_text=ans.answer_text,
            selected_option_ids=ans.selected_option_ids,
            is_correct=is_correct,
            marks_awarded=marks_awarded
        )
        db.add(db_answer)
        
    attempt.submitted_at = datetime.datetime.utcnow()
    
    if needs_manual_grading:
        attempt.status = "PENDING_EVALUATION"
        attempt.score = earned_marks
        attempt.percentage = int((earned_marks / total_marks * 100)) if total_marks > 0 else 0
        attempt.passed = False
    else:
        attempt.status = "SUBMITTED"
        attempt.score = earned_marks
        attempt.percentage = int((earned_marks / total_marks * 100)) if total_marks > 0 else 0
        attempt.passed = attempt.percentage >= assessment.passing_score
        
    await db.commit()
    await db.refresh(attempt)
    
    return {
        "attempt_id": attempt.id,
        "score": attempt.score,
        "percentage": attempt.percentage,
        "passed": attempt.passed,
        "status": attempt.status
    }
