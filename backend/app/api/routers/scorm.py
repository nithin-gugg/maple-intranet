import os
import shutil
import tempfile
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.learning import LearningPackage
from app.scorm.extractor import ScormExtractor

router = APIRouter()
extractor = ScormExtractor()

@router.post("/upload")
async def upload_scorm_package(
    title: str = Form(...),
    version: str = Form("1.0"),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    if not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="Only .zip files are allowed")

    # Save uploaded file temporarily
    temp_fd, temp_path = tempfile.mkstemp(suffix=".zip")
    try:
        with os.fdopen(temp_fd, "wb") as temp_file:
            shutil.copyfileobj(file.file, temp_file)
        
        # Extract and parse
        result = extractor.extract_package(temp_path)
        
        # Save metadata to DB
        package = LearningPackage(
            title=title,
            version=version,
            standard="SCORM_1_2",
            standard_version="1.2",
            entry_point_url=result["entry_point_url"],
            uploaded_by="temp_admin_user" # Mocked for now
        )
        db.add(package)
        await db.commit()
        await db.refresh(package)
        
        return {"id": package.id, "title": package.title, "entry_point_url": package.entry_point_url}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error during extraction.")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
