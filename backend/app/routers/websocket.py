import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.websocket import WebSocketMessage
from app.services.websocket_manager import websocket_manager
from app.services.room_service import RoomService

router = APIRouter()


@router.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    """WebSocket endpoint for real-time collaboration"""
    user_id = None
    
    try:
        # Get display name from query parameters
        query_params = dict(websocket.query_params)
        display_name = query_params.get('display_name', 'Anonymous')
        
        # Connect user to the room
        user_id = await websocket_manager.connect(websocket, room_id, display_name)
        
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            
            try:
                message_data = json.loads(data)
                message = WebSocketMessage(**message_data)
                
                # Handle the message
                await websocket_manager.handle_message(message, user_id)
                
            except json.JSONDecodeError:
                await websocket_manager.send_personal_message({
                    "type": "error",
                    "message": "Invalid JSON format"
                }, websocket)
            except Exception as e:
                await websocket_manager.send_personal_message({
                    "type": "error",
                    "message": f"Error processing message: {str(e)}"
                }, websocket)
    
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        # Clean up connection
        if user_id:
            websocket_manager.disconnect(room_id, user_id)
            
            # Notify other users about disconnection
            remaining_users = list(websocket_manager.room_users.get(room_id, {}).values())
            await websocket_manager.broadcast_to_room({
                "type": "user_left",
                "roomId": room_id,
                "userId": user_id,
                "data": {
                    "userCount": websocket_manager.get_room_user_count(room_id),
                    "connectedUsers": remaining_users
                }
            }, room_id)


@router.get("/ws/rooms/{room_id}/status")
async def get_room_status(room_id: str):
    """Get current status of a room"""
    return {
        "roomId": room_id,
        "userCount": websocket_manager.get_room_user_count(room_id),
        "hasCode": bool(websocket_manager.get_room_code(room_id))
    }