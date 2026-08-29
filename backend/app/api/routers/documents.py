from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.document import Document, DocumentCategory
from app.api.deps import get_current_user, require_admin

router = APIRouter()

@router.get("/categories", response_model=None)
async def get_document_categories(
    db: AsyncSession = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    result = await db.execute(select(DocumentCategory))
    return result.scalars().all()

@router.get("", response_model=None)
async def get_documents(
    category_id: int | None = None,
    db: AsyncSession = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    query = select(Document)
    if category_id:
        query = query.where(Document.category_id == category_id)
    
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{document_id}", response_model=None)
async def get_document(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    # current_user = Depends(get_current_user)
):
    result = await db.execute(select(Document).where(Document.id == document_id))
    return result.scalars().first()

from pydantic import BaseModel

class DocumentCreate(BaseModel):
    title: str
    description: str | None = None
    category_id: int
    department_id: int | None = None
    drive_url: str
    document_type: str = "DOCUMENT"
    visibility: str = "ALL_EMPLOYEES"

@router.post("", response_model=None)
async def create_document(
    doc_in: DocumentCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_admin)
):
    document = Document(
        title=doc_in.title,
        description=doc_in.description,
        category_id=doc_in.category_id,
        department_id=doc_in.department_id,
        drive_url=doc_in.drive_url,
        document_type=doc_in.document_type,
        visibility=doc_in.visibility,
        version="1.0",
        status="PUBLISHED",
        created_by="temp_admin_user" # Mocked user
    )
    db.add(document)
    await db.commit()
    await db.refresh(document)
    return document

class DocumentUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category_id: int | None = None
    department_id: int | None = None
    drive_url: str | None = None
    visibility: str | None = None

@router.put("/{document_id}", response_model=None)
async def update_document(
    document_id: int,
    doc_in: DocumentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_admin)
):
    from fastapi import HTTPException
    
    result = await db.execute(select(Document).where(Document.id == document_id))
    document = result.scalars().first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
        
    update_data = doc_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(document, field, value)
        
    await db.commit()
    await db.refresh(document)
    return document

@router.delete("/{document_id}", response_model=None)
async def delete_document(
    document_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_admin)
):
    from fastapi import HTTPException
    
    result = await db.execute(select(Document).where(Document.id == document_id))
    document = result.scalars().first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
        
    await db.delete(document)
    await db.commit()
    return {"message": "Document deleted successfully"}
