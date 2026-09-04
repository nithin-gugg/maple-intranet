from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from pydantic import BaseModel
import shutil
import os
import uuid
import json

from app.core.database import get_db
from app.models.certificate import CertificateTemplate, Certificate
from app.api.deps import get_current_user

router = APIRouter()

UPLOAD_DIR = "static/certificates/templates"

class TemplateConfigUpdate(BaseModel):
    name: str
    config_json: dict

@router.get("/templates")
async def get_templates(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(CertificateTemplate).order_by(CertificateTemplate.created_at.desc()))
    return res.scalars().all()

@router.post("/templates")
async def create_template(
    name: str = Form(...),
    config_json: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_ext = os.path.splitext(file.filename)[1] if file.filename else ""
    if file_ext.lower() != ".pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported for templates.")
        
    new_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, new_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        parsed_config = json.loads(config_json)
    except json.JSONDecodeError:
        parsed_config = {}
        
    template = CertificateTemplate(
        name=name,
        file_path=file_path,
        config_json=parsed_config
    )
    db.add(template)
    await db.commit()
    await db.refresh(template)
    return template

@router.put("/templates/{template_id}")
async def update_template(
    template_id: int,
    config_in: TemplateConfigUpdate,
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(CertificateTemplate).where(CertificateTemplate.id == template_id))
    template = res.scalars().first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
        
    template.name = config_in.name
    template.config_json = config_in.config_json
    await db.commit()
    return template

@router.get("/my")
async def get_my_certificates(
    user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    from app.models.learning import Course
    res = await db.execute(
        select(Certificate, Course.title.label("course_title"))
        .outerjoin(Course, Certificate.course_id == Course.id)
        .where(Certificate.user_id == user.id)
        .order_by(Certificate.issued_at.desc())
    )
    rows = res.all()
    return [
        {
            "id": c.Certificate.id,
            "certificate_number": c.Certificate.certificate_number,
            "course_id": c.Certificate.course_id,
            "course_title": c.course_title,
            "generated_file_path": c.Certificate.generated_file_path,
            "issued_at": c.Certificate.issued_at
        } for c in rows
    ]

@router.get("/all")
async def get_all_certificates(
    db: AsyncSession = Depends(get_db)
):
    # This should ideally be protected by admin role check
    from app.models.learning import Course
    from app.models.core import User
    res = await db.execute(
        select(Certificate, Course.title.label("course_title"), User.first_name, User.last_name)
        .outerjoin(Course, Certificate.course_id == Course.id)
        .outerjoin(User, Certificate.user_id == User.id)
        .order_by(Certificate.issued_at.desc())
    )
    rows = res.all()
    return [
        {
            "id": c.Certificate.id,
            "certificate_number": c.Certificate.certificate_number,
            "user_id": c.Certificate.user_id,
            "user_name": f"{c.first_name} {c.last_name}".strip(),
            "course_id": c.Certificate.course_id,
            "course_title": c.course_title,
            "generated_file_path": c.Certificate.generated_file_path,
            "issued_at": c.Certificate.issued_at
        } for c in rows
    ]
