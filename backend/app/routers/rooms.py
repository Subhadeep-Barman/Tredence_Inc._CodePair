from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.room import RoomCreate, RoomResponse
from app.services.room_service import RoomService

router = APIRouter()


@router.post("/rooms", response_model=RoomResponse)
async def create_room(
    room_data: RoomCreate = RoomCreate(),
    db: AsyncSession = Depends(get_db)
):
    """Create a new room for pair programming"""
    try:
        room = await RoomService.create_room(db, room_data)
        return RoomResponse(
            roomId=room.room_id,
            language=room.language,
            created_at=room.created_at
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create room")


@router.get("/rooms/{room_id}")
async def get_room(room_id: str, db: AsyncSession = Depends(get_db)):
    """Get room information"""
    room = await RoomService.get_room_by_id(db, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    return {
        "roomId": room.room_id,
        "language": room.language,
        "codeContent": room.code_content,
        "createdAt": room.created_at,
        "updatedAt": room.updated_at
    }