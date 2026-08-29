from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class KudosReasonSchema(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None

    class Config:
        from_attributes = True

class KudosPresentSchema(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    value: int

    class Config:
        from_attributes = True

class KudosCreate(BaseModel):
    recipient_id: str
    reason_id: int
    present_id: Optional[int] = None
    message: str = Field(..., min_length=1, max_length=1000)
    stars: int = Field(..., ge=1, le=5)

class KudosSchema(BaseModel):
    id: int
    sender_id: str
    recipient_id: str
    reason_id: int
    present_id: Optional[int] = None
    message: str
    stars: int
    status: str
    created_at: datetime
    
    reason: KudosReasonSchema
    present: Optional[KudosPresentSchema] = None
    
    # We will serialize employee + user information manually or using nested schemas
    sender: dict
    recipient: dict

    class Config:
        from_attributes = True

class KudosStats(BaseModel):
    total_received: int
    stars_received: int
    presents_received: int
    most_common_reason: Optional[str] = None

class LeaderboardEntry(BaseModel):
    employee_id: str
    employee_name: str
    employee_avatar: Optional[str] = None
    designation: Optional[str] = None
    total_stars: int
    kudos_count: int
