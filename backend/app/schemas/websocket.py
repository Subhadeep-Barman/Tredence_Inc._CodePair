from pydantic import BaseModel
from typing import Optional, Any, Dict


class WebSocketMessage(BaseModel):
    type: str  # "join_room", "code_update", "cursor_update", "user_joined", "user_left"
    roomId: str
    userId: Optional[str] = None
    data: Optional[Dict[str, Any]] = None