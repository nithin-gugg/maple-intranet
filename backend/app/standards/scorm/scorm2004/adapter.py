import uuid
from typing import Dict, Any

from app.standards.base.adapter import LearningStandardAdapter
from app.learning.enums import SessionStatus
from app.standards.scorm.scorm2004.extractor import Scorm2004Extractor
from app.models.learning import LearningSession
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

class Scorm2004Adapter(LearningStandardAdapter):
    def __init__(self, db_session: AsyncSession = None):
        self.extractor = Scorm2004Extractor()
        self.db = db_session

    def detect(self, package_path: str) -> bool:
        pass

    def extract(self, package_path: str, destination_dir: str) -> Dict[str, Any]:
        package_id = str(uuid.uuid4())
        return self.extractor.extract(package_path, package_id)

    def validate(self, package_path: str) -> Dict[str, Any]:
        return {"valid": True}

    async def create_session(self, package_id: int, user_id: str) -> Dict[str, Any]:
        session = LearningSession(
            user_id=user_id,
            package_id=package_id,
            lesson_status="incomplete" # SCORM 2004 uses completion_status, we map it internally
        )
        self.db.add(session)
        await self.db.commit()
        await self.db.refresh(session)
        return {"session_id": session.id, "error": "0"}

    async def get_launch_url(self, package_id: int, session_id: int) -> str:
        pass

    async def get_progress(self, session_id: int) -> Dict[str, Any]:
        session_res = await self.db.execute(select(LearningSession).where(LearningSession.id == session_id))
        session = session_res.scalars().first()
        
        if not session:
            return {"status": SessionStatus.NOT_STARTED}

        status = SessionStatus.IN_PROGRESS
        # Map SCORM 2004 completion_status or success_status to our SessionStatus
        if session.lesson_status in ["completed", "passed"]:
            status = SessionStatus.COMPLETED

        return {
            "status": status,
            "progress_percent": 100 if status == SessionStatus.COMPLETED else 0,
            "score": session.score_raw,
            "time": session.session_time
        }

    async def terminate_session(self, session_id: int) -> Dict[str, Any]:
        pass
