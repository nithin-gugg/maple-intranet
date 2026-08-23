from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.core.database import Base
from sqlalchemy.dialects.postgresql import JSONB

class CourseCategory(Base):
    __tablename__ = "course_categories"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    color_tag: Mapped[Optional[str]] = mapped_column(String(50)) # For Design.md accent tags
    
    courses: Mapped[List["Course"]] = relationship(back_populates="category")

class Course(Base):
    __tablename__ = "courses"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String(1024))
    category_id: Mapped[int] = mapped_column(ForeignKey("course_categories.id"))
    created_by: Mapped[str] = mapped_column(ForeignKey("users.id"))
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    category: Mapped["CourseCategory"] = relationship(back_populates="courses")
    modules: Mapped[List["CourseModule"]] = relationship(back_populates="course", cascade="all, delete-orphan")
    enrollments: Mapped[List["CourseEnrollment"]] = relationship(back_populates="course")

class CourseModule(Base):
    __tablename__ = "course_modules"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(255))
    order: Mapped[int] = mapped_column(default=0)
    content_type: Mapped[str] = mapped_column(String(50)) # VIDEO, SCORM, QUIZ, TEXT
    learning_package_id: Mapped[Optional[int]] = mapped_column(ForeignKey("learning_packages.id", ondelete="SET NULL"))
    
    course: Mapped["Course"] = relationship(back_populates="modules")
    learning_package = relationship("LearningPackage")

class CourseEnrollment(Base):
    __tablename__ = "course_enrollments"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    status: Mapped[str] = mapped_column(String(50), default="ENROLLED") # ENROLLED, IN_PROGRESS, COMPLETED
    progress_percent: Mapped[int] = mapped_column(default=0)
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    course: Mapped["Course"] = relationship(back_populates="enrollments")

class LearningPackage(Base):
    __tablename__ = "learning_packages"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255))
    version: Mapped[str] = mapped_column(String(50))
    standard: Mapped[str] = mapped_column(String(50), default="SCORM_1_2")
    declared_standard: Mapped[Optional[str]] = mapped_column(String(50))
    detected_standard: Mapped[Optional[str]] = mapped_column(String(50))
    standard_version: Mapped[str] = mapped_column(String(50), default="1.2")
    package_type: Mapped[str] = mapped_column(String(50), default="scorm_1_2") # scorm_1_2, scorm_2004, xapi, cmi5
    manifest_path: Mapped[Optional[str]] = mapped_column(String(512))
    package_hash: Mapped[Optional[str]] = mapped_column(String(255), index=True)
    entry_point_url: Mapped[str] = mapped_column(String(1024))
    storage_provider: Mapped[Optional[str]] = mapped_column(String(50))
    storage_bucket: Mapped[Optional[str]] = mapped_column(String(50))
    storage_path: Mapped[Optional[str]] = mapped_column(String(512))
    storage_version: Mapped[Optional[str]] = mapped_column(String(50))
    launch_file: Mapped[Optional[str]] = mapped_column(String(255))
    package_version: Mapped[int] = mapped_column(default=1)
    uploaded_by: Mapped[str] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

class LearningAttempt(Base):
    __tablename__ = "learning_attempts"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    course_id: Mapped[Optional[int]] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), index=True)
    package_id: Mapped[int] = mapped_column(ForeignKey("learning_packages.id", ondelete="CASCADE"), index=True)
    attempt_number: Mapped[int] = mapped_column(default=1)
    standard: Mapped[str] = mapped_column(String(50)) # scorm_1_2, scorm_2004, cmi5, xapi
    status: Mapped[str] = mapped_column(String(50), default="not attempted") # incomplete, completed, passed, failed, browsed
    score: Mapped[Optional[float]] = mapped_column()
    progress_percent: Mapped[Optional[int]] = mapped_column(default=0)
    total_time_seconds: Mapped[Optional[int]] = mapped_column(default=0)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_activity_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

class LearningActivityEvent(Base):
    __tablename__ = "learning_activity_events"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    course_id: Mapped[Optional[int]] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), index=True)
    package_id: Mapped[int] = mapped_column(ForeignKey("learning_packages.id", ondelete="CASCADE"), index=True)
    attempt_id: Mapped[int] = mapped_column(ForeignKey("learning_attempts.id", ondelete="CASCADE"), index=True)
    activity_id: Mapped[Optional[str]] = mapped_column(String(255), index=True)
    
    event_type: Mapped[str] = mapped_column(String(50), index=True) # initialized, progress, completed, etc.
    progress_percent: Mapped[Optional[int]] = mapped_column()
    completion_status: Mapped[Optional[str]] = mapped_column(String(50))
    success_status: Mapped[Optional[str]] = mapped_column(String(50))
    score_raw: Mapped[Optional[float]] = mapped_column()
    score_scaled: Mapped[Optional[float]] = mapped_column()
    duration_seconds: Mapped[Optional[int]] = mapped_column()
    location: Mapped[Optional[str]] = mapped_column(String(1024))
    
    source_standard: Mapped[str] = mapped_column(String(50))
    source_event_id: Mapped[Optional[str]] = mapped_column(String(255), index=True)
    metadata_json: Mapped[dict] = mapped_column(JSON, default=dict)
    
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
class RuntimeState(Base):
    __tablename__ = "runtime_states"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    attempt_id: Mapped[int] = mapped_column(ForeignKey("learning_attempts.id", ondelete="CASCADE"), unique=True, index=True)
    cmi_data: Mapped[dict] = mapped_column(JSON, default=dict) # Use JSON for sqlite compatibility in dev, fallback to JSONB in prod
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class ScormRuntimeState(Base):
    __tablename__ = "scorm_runtime_states"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    attempt_id: Mapped[int] = mapped_column(ForeignKey("learning_attempts.id", ondelete="CASCADE"), unique=True, index=True)
    package_id: Mapped[Optional[int]] = mapped_column(ForeignKey("learning_packages.id", ondelete="CASCADE"), index=True)
    sco_id: Mapped[Optional[str]] = mapped_column(String(255))
    lesson_status: Mapped[Optional[str]] = mapped_column(String(50))
    lesson_location: Mapped[Optional[str]] = mapped_column(String(1024))
    suspend_data: Mapped[Optional[str]] = mapped_column(Text)
    score_raw: Mapped[Optional[float]] = mapped_column()
    score_min: Mapped[Optional[float]] = mapped_column()
    score_max: Mapped[Optional[float]] = mapped_column()
    session_time: Mapped[Optional[str]] = mapped_column(String(50))
    total_time: Mapped[Optional[str]] = mapped_column(String(50))
    lesson_mode: Mapped[Optional[str]] = mapped_column(String(50))
    credit: Mapped[Optional[str]] = mapped_column(String(50))
    entry: Mapped[Optional[str]] = mapped_column(String(50))
    exit: Mapped[Optional[str]] = mapped_column(String(50))
    cmi_data: Mapped[dict] = mapped_column(JSON, default=dict) # Fallback / catch-all for untyped elements
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

# Legacy tables below (keep until full migration is confirmed)
class LearningSession(Base):
    __tablename__ = "learning_sessions"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    package_id: Mapped[int] = mapped_column(ForeignKey("learning_packages.id", ondelete="CASCADE"))
    lesson_status: Mapped[str] = mapped_column(String(50), default="not attempted")
    score_raw: Mapped[Optional[int]] = mapped_column()
    session_time: Mapped[Optional[str]] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class LearningTracking(Base):
    __tablename__ = "learning_tracking"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("learning_sessions.id", ondelete="CASCADE"))
    cmi_key: Mapped[str] = mapped_column(String(255))
    cmi_value: Mapped[str] = mapped_column(Text)

class XApiStatement(Base):
    __tablename__ = "xapi_statements"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    statement_id: Mapped[str] = mapped_column(String(36), unique=True, index=True)
    actor: Mapped[dict] = mapped_column(JSON)
    verb: Mapped[dict] = mapped_column(JSON)
    object: Mapped[dict] = mapped_column(JSON)
    result: Mapped[Optional[dict]] = mapped_column(JSON)
    context: Mapped[Optional[dict]] = mapped_column(JSON)
    authority: Mapped[Optional[dict]] = mapped_column(JSON)
    timestamp: Mapped[Optional[str]] = mapped_column(String(50), index=True)
    stored: Mapped[Optional[str]] = mapped_column(String(50))
    version: Mapped[Optional[str]] = mapped_column(String(20))
    raw_statement: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

# CMI5 specific models
class Cmi5AssignableUnit(Base):
    __tablename__ = "cmi5_assignable_units"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    package_id: Mapped[int] = mapped_column(ForeignKey("learning_packages.id", ondelete="CASCADE"), index=True)
    au_id: Mapped[str] = mapped_column(String(255)) # The IRI identifier from cmi5.xml
    title: Mapped[str] = mapped_column(String(255))
    launch_method: Mapped[str] = mapped_column(String(20), default="AnyWindow") # AnyWindow, OwnWindow
    move_on: Mapped[str] = mapped_column(String(50), default="CompletedAndPassed") # NotApplicable, Passed, Completed, CompletedAndPassed, CompletedOrPassed
    mastery_score: Mapped[Optional[float]] = mapped_column()
    return_url_support: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
class Cmi5Registration(Base):
    __tablename__ = "cmi5_registrations"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    attempt_id: Mapped[int] = mapped_column(ForeignKey("learning_attempts.id", ondelete="CASCADE"), unique=True, index=True)
    registration_id: Mapped[str] = mapped_column(String(36), unique=True, index=True) # UUID
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

class Cmi5Session(Base):
    __tablename__ = "cmi5_sessions"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    registration_id: Mapped[str] = mapped_column(ForeignKey("cmi5_registrations.registration_id", ondelete="CASCADE"), index=True)
    session_id: Mapped[str] = mapped_column(String(36), unique=True, index=True) # UUID
    au_id: Mapped[str] = mapped_column(String(255))
    auth_token: Mapped[str] = mapped_column(String(255), index=True) # Token given to AU for LRS access
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

class XApiState(Base):
    __tablename__ = "xapi_states"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    activity_id: Mapped[str] = mapped_column(String(1024), index=True)
    agent_id: Mapped[str] = mapped_column(String(255), index=True) # Usually the mbox or account string
    registration: Mapped[Optional[str]] = mapped_column(String(36), index=True)
    state_id: Mapped[str] = mapped_column(String(255), index=True)
    state_data: Mapped[dict] = mapped_column(JSON)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class XApiProfile(Base):
    __tablename__ = "xapi_profiles"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    agent_id: Mapped[str] = mapped_column(String(255), index=True)
    profile_id: Mapped[str] = mapped_column(String(255), index=True)
    profile_data: Mapped[dict] = mapped_column(JSON)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
