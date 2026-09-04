from datetime import datetime
from typing import Optional, Any
from sqlalchemy import String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.core.database import Base

class CertificateTemplate(Base):
    __tablename__ = "certificate_templates"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255))
    file_path: Mapped[str] = mapped_column(String(1024))
    config_json: Mapped[dict] = mapped_column(JSON, default=dict)
    # config_json structure example:
    # {
    #   "employee_name": {"x": 100, "y": 200, "font_size": 24, "font": "Helvetica"},
    #   "course_name": {"x": 100, "y": 250, "font_size": 20, "font": "Helvetica"},
    #   "completion_date": {"x": 100, "y": 300, "font_size": 16, "font": "Helvetica"},
    #   "certificate_id": {"x": 100, "y": 350, "font_size": 12, "font": "Helvetica"}
    # }
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Certificate(Base):
    __tablename__ = "certificates"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    certificate_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), index=True)
    template_id: Mapped[Optional[int]] = mapped_column(ForeignKey("certificate_templates.id", ondelete="SET NULL"), index=True)
    generated_file_path: Mapped[str] = mapped_column(String(1024))
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    template: Mapped[Optional["CertificateTemplate"]] = relationship()
