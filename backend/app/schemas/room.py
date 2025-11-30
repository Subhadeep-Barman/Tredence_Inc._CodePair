from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class RoomCreate(BaseModel):
    language: Optional[str] = "python"


class RoomResponse(BaseModel):
    roomId: str
    language: str
    created_at: datetime
    
    class Config:
        from_attributes = True