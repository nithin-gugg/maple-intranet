from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class LearningEvent(BaseModel):
    user_id: str
    course_id: Optional[int]
    package_id: int
    attempt_id: int
    activity_id: Optional[str]
    
    # Standardized LMS events: initialized, progress, experienced, completed, passed, failed, suspended, resumed, terminated, scored, time_update
    event_type: str
    
    progress_percent: Optional[int] = None
    completion_status: Optional[str] = None
    success_status: Optional[str] = None
    score_raw: Optional[float] = None
    score_scaled: Optional[float] = None
    duration_seconds: Optional[int] = None
    location: Optional[str] = None
    
    timestamp: datetime
    source_standard: str
    source_event_id: Optional[str] = None
    metadata: Dict[str, Any] = {}
