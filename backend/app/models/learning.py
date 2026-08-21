from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.core.database import Base

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
    standard_version: Mapped[str] = mapped_column(String(50), default="1.2")
    entry_point_url: Mapped[str] = mapped_column(String(1024))
    storage_provider: Mapped[Optional[str]] = mapped_column(String(50))
    storage_bucket: Mapped[Optional[str]] = mapped_column(String(50))
    storage_path: Mapped[Optional[str]] = mapped_column(String(512))
    storage_version: Mapped[Optional[str]] = mapped_column(String(50))
    launch_file: Mapped[Optional[str]] = mapped_column(String(255))
    package_version: Mapped[int] = mapped_column(default=1)
    uploaded_by: Mapped[str] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

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
