from datetime import datetime
from typing import Optional, List
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text, Integer, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class KudosStatus(str, enum.Enum):
    ACTIVE = "active"
    DELETED = "deleted"

class KudosReason(Base):
    __tablename__ = "kudos_reasons"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(String(255))
    icon: Mapped[Optional[str]] = mapped_column(String(50))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    kudos: Mapped[List["Kudos"]] = relationship(back_populates="reason")

class KudosPresent(Base):
    __tablename__ = "kudos_presents"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(String(255))
    icon: Mapped[Optional[str]] = mapped_column(String(50))
    value: Mapped[Optional[int]] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    kudos: Mapped[List["Kudos"]] = relationship(back_populates="present")

class Kudos(Base):
    __tablename__ = "kudos"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    sender_id: Mapped[str] = mapped_column(ForeignKey("employees.id", ondelete="CASCADE"), index=True)
    recipient_id: Mapped[str] = mapped_column(ForeignKey("employees.id", ondelete="CASCADE"), index=True)
    reason_id: Mapped[int] = mapped_column(ForeignKey("kudos_reasons.id", ondelete="RESTRICT"))
    present_id: Mapped[Optional[int]] = mapped_column(ForeignKey("kudos_presents.id", ondelete="SET NULL"))
    
    message: Mapped[str] = mapped_column(Text)
    stars: Mapped[int] = mapped_column(Integer)
    status: Mapped[KudosStatus] = mapped_column(String(20), default=KudosStatus.ACTIVE, server_default="active")
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    sender: Mapped["Employee"] = relationship(foreign_keys=[sender_id])
    recipient: Mapped["Employee"] = relationship(foreign_keys=[recipient_id])
    reason: Mapped["KudosReason"] = relationship(back_populates="kudos")
    present: Mapped[Optional["KudosPresent"]] = relationship(back_populates="kudos")
