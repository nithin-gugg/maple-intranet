import os
import shutil
import tempfile
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.learning import LearningPackage
from app.learning.enums import PackageStandard
from app.learning.services.package_detector import PackageDetector
from app.standards.scorm.scorm12.extractor import Scorm12Extractor

router = APIRouter()
detector = PackageDetector()

@router.post("/upload")
async def upload_learning_package(
    title: str = Form(...),
    version: str = Form("1.0"),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    if not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="Only .zip files are allowed")

    temp_fd, temp_path = tempfile.mkstemp(suffix=".zip")
    try:
        with os.fdopen(temp_fd, "wb") as temp_file:
            shutil.copyfileobj(file.file, temp_file)
        
        standard = detector.detect(temp_path)
        
        if standard == PackageStandard.UNKNOWN:
            raise HTTPException(status_code=400, detail="Unsupported package format")

        import uuid
        pkg_id = str(uuid.uuid4())
        
        result = {}
        if standard == PackageStandard.SCORM_1_2:
            from app.standards.scorm.scorm12.extractor import Scorm12Extractor
            extractor = Scorm12Extractor()
            result = extractor.extract(temp_path, pkg_id)
            
        elif standard == PackageStandard.SCORM_2004:
            from app.standards.scorm.scorm2004.extractor import Scorm2004Extractor
            extractor = Scorm2004Extractor()
            result = extractor.extract(temp_path, pkg_id)
            
        elif standard == PackageStandard.XAPI:
            from app.standards.xapi.extractor import XapiExtractor
            extractor = XapiExtractor()
            result = extractor.extract(temp_path, pkg_id)
            
        elif standard == PackageStandard.CMI5:
            from app.standards.cmi5.extractor import Cmi5Extractor
            extractor = Cmi5Extractor()
            result = extractor.extract(temp_path, pkg_id)

        package = LearningPackage(
            title=title,
            version=version,
            standard=standard.value,
            standard_version="1.2" if standard == PackageStandard.SCORM_1_2 else "Unknown",
            entry_point_url=result.get("entry_point_url", ""),
            uploaded_by="temp_admin_user" # Mocked for now
        )
        db.add(package)
        await db.commit()
        await db.refresh(package)
        
        return {"id": package.id, "title": package.title, "standard": package.standard, "entry_point_url": package.entry_point_url}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error during extraction.")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
