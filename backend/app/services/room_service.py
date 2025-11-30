import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.room import Room
from app.schemas.room import RoomCreate


class RoomService:
    @staticmethod
    async def create_room(db: AsyncSession, room_data: RoomCreate) -> Room:
        """Create a new room with validation and limits"""
        # Validate language
        valid_languages = ["python", "javascript", "typescript"]
        if room_data.language not in valid_languages:
            raise ValueError(f"Invalid language. Must be one of: {valid_languages}")
        
        # Check room count limit
        result = await db.execute(select(Room))
        room_count = len(result.scalars().all())
        if room_count >= 100:
            raise ValueError("Server at capacity. Please try again later.")
        
        room_id = str(uuid.uuid4())[:8]
        
        # Ensure room ID is unique (max 10 attempts)
        attempts = 0
        while await RoomService.get_room_by_id(db, room_id) and attempts < 10:
            room_id = str(uuid.uuid4())[:8]
            attempts += 1
        
        if attempts >= 10:
            raise ValueError("Unable to generate unique room ID")
        
        room = Room(
            room_id=room_id,
            language=room_data.language,
            code_content=""
        )
        
        db.add(room)
        await db.commit()
        await db.refresh(room)
        return room
    
    @staticmethod
    async def get_room_by_id(db: AsyncSession, room_id: str) -> Room | None:
        """Get room by room_id"""
        result = await db.execute(select(Room).where(Room.room_id == room_id))
        return result.scalar_one_or_none()
    
    @staticmethod
    async def update_room_code(db: AsyncSession, room_id: str, code_content: str) -> Room | None:
        """Update room's code content"""
        room = await RoomService.get_room_by_id(db, room_id)
        if room:
            room.code_content = code_content
            await db.commit()
            await db.refresh(room)
        return room