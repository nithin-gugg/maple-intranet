from datetime import datetime
from typing import List, Optional, Any
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Assessment(Base):
    __tablename__ = "assessments"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text)
    instructions: Mapped[Optional[str]] = mapped_column(Text)
    passing_score: Mapped[int] = mapped_column(default=70)
    time_limit_minutes: Mapped[Optional[int]] = mapped_column()
    attempts_allowed: Mapped[Optional[int]] = mapped_column() # Null means unlimited
    status: Mapped[str] = mapped_column(String(50), default="Draft") # Draft, Published
    created_by: Mapped[str] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    questions: Mapped[List["AssessmentQuestion"]] = relationship(back_populates="assessment", cascade="all, delete-orphan")
    attempts: Mapped[List["AssessmentAttempt"]] = relationship(back_populates="assessment", cascade="all, delete-orphan")

class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    assessment_id: Mapped[int] = mapped_column(ForeignKey("assessments.id", ondelete="CASCADE"), index=True)
    question_type: Mapped[str] = mapped_column(String(50), default="MULTIPLE_CHOICE") # MULTIPLE_CHOICE, MULTIPLE_ANSWER, TRUE_FALSE, SHORT_ANSWER, PARAGRAPH
    question_text: Mapped[str] = mapped_column(Text)
    explanation: Mapped[Optional[str]] = mapped_column(Text)
    marks: Mapped[int] = mapped_column(default=10)
    sort_order: Mapped[int] = mapped_column(default=0)

    assessment: Mapped["Assessment"] = relationship(back_populates="questions")
    options: Mapped[List["AssessmentOption"]] = relationship(back_populates="question", cascade="all, delete-orphan")
    answers: Mapped[List["AssessmentAnswer"]] = relationship(back_populates="question", cascade="all, delete-orphan")

class AssessmentOption(Base):
    __tablename__ = "assessment_options"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    question_id: Mapped[int] = mapped_column(ForeignKey("assessment_questions.id", ondelete="CASCADE"), index=True)
    option_text: Mapped[str] = mapped_column(Text)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False)
    sort_order: Mapped[int] = mapped_column(default=0)

    question: Mapped["AssessmentQuestion"] = relationship(back_populates="options")

class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    assessment_id: Mapped[int] = mapped_column(ForeignKey("assessments.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    course_id: Mapped[Optional[int]] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), index=True)
    attempt_number: Mapped[int] = mapped_column(default=1)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    score: Mapped[Optional[float]] = mapped_column()
    percentage: Mapped[Optional[int]] = mapped_column()
    passed: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String(50), default="IN_PROGRESS") # IN_PROGRESS, SUBMITTED, PENDING_EVALUATION, GRADED

    assessment: Mapped["Assessment"] = relationship(back_populates="attempts")
    answers: Mapped[List["AssessmentAnswer"]] = relationship(back_populates="attempt", cascade="all, delete-orphan")

class AssessmentAnswer(Base):
    __tablename__ = "assessment_answers"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    attempt_id: Mapped[int] = mapped_column(ForeignKey("assessment_attempts.id", ondelete="CASCADE"), index=True)
    question_id: Mapped[int] = mapped_column(ForeignKey("assessment_questions.id", ondelete="CASCADE"), index=True)
    answer_text: Mapped[Optional[str]] = mapped_column(Text) # Used for short answer/paragraph
    selected_option_ids: Mapped[Optional[Any]] = mapped_column(JSON) # JSON list of selected option IDs
    is_correct: Mapped[Optional[bool]] = mapped_column(Boolean)
    marks_awarded: Mapped[Optional[float]] = mapped_column(default=0)

    attempt: Mapped["AssessmentAttempt"] = relationship(back_populates="answers")
    question: Mapped["AssessmentQuestion"] = relationship(back_populates="answers")
