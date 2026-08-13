from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(String(255))
    
    users: Mapped[List["User"]] = relationship(
        secondary="user_roles", back_populates="roles"
    )

class UserRole(Base):
    __tablename__ = "user_roles"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True)

class User(Base):
    __tablename__ = "users"

    # Clerk user ID as primary key
    id: Mapped[str] = mapped_column(String(255), primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    profile_image_url: Mapped[Optional[str]] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    roles: Mapped[List["Role"]] = relationship(
        secondary="user_roles", back_populates="users"
    )
    employee: Mapped[Optional["Employee"]] = relationship(back_populates="user", uselist=False)

class Department(Base):
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    manager_id: Mapped[Optional[str]] = mapped_column(ForeignKey("employees.id", ondelete="SET NULL", use_alter=True))
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    employees: Mapped[List["Employee"]] = relationship(back_populates="department", foreign_keys="Employee.department_id")
    manager: Mapped[Optional["Employee"]] = relationship(
        back_populates="managed_departments", foreign_keys=[manager_id]
    )

class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    employee_id: Mapped[Optional[str]] = mapped_column(String(100), unique=True, index=True)
    date_of_birth: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    onboarding_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    onboarding_step: Mapped[int] = mapped_column(default=1)
    designation: Mapped[str] = mapped_column(String(100))
    phone: Mapped[Optional[str]] = mapped_column(String(20))
    joining_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    location: Mapped[Optional[str]] = mapped_column(String(100))
    bio: Mapped[Optional[str]] = mapped_column(Text)
    skills: Mapped[Optional[str]] = mapped_column(Text) # Stored as JSON or comma separated
    department_id: Mapped[Optional[int]] = mapped_column(ForeignKey("departments.id", ondelete="SET NULL"))
    manager_id: Mapped[Optional[str]] = mapped_column(ForeignKey("employees.id", ondelete="SET NULL"))

    user: Mapped["User"] = relationship(back_populates="employee")
    department: Mapped[Optional["Department"]] = relationship(back_populates="employees", foreign_keys=[department_id])
    managed_departments: Mapped[List["Department"]] = relationship(
        back_populates="manager", foreign_keys="Department.manager_id"
    )
    
    manager: Mapped[Optional["Employee"]] = relationship(
        back_populates="team_members", remote_side=[id], foreign_keys=[manager_id]
    )
    team_members: Mapped[List["Employee"]] = relationship(
        back_populates="manager", foreign_keys=[manager_id]
    )
