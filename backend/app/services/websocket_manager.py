import json
import uuid
import time
import asyncio
from typing import Dict, List
from fastapi import WebSocket
from app.schemas.websocket import WebSocketMessage


class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
        self.room_states: Dict[str, Dict[str, str]] = {}
        self.room_users: Dict[str, Dict[str, str]] = {}  # room_id -> {user_id: display_name}
        self.room_last_activity: Dict[str, float] = {}
        self.max_rooms = 100
        self.room_timeout = 3600  # 1 hour
        
        # Cleanup task will be started when needed
        self._cleanup_task = None
    
    async def connect(self, websocket: WebSocket, room_id: str, display_name: str = "Anonymous") -> str:
        """Connect a user to a room and return user_id"""
        await websocket.accept()
        
        user_id = str(uuid.uuid4())[:8]
        
        if room_id not in self.active_connections:
            self.active_connections[room_id] = {}
            self.room_states[room_id] = {"code": "", "language": "python"}
            self.room_users[room_id] = {}
        
        # Check room limit
        if len(self.active_connections) >= self.max_rooms and room_id not in self.active_connections:
            await websocket.close(code=1008, reason="Server at capacity")
            return None
        
        self.active_connections[room_id][user_id] = websocket
        self.room_users[room_id][user_id] = display_name
        self.room_last_activity[room_id] = time.time()
        
        # Send complete room state to the new user
        current_user_count = len(self.active_connections[room_id])
        connected_users = list(self.room_users[room_id].values())
        await self.send_personal_message({
            "type": "room_state",
            "roomId": room_id,
            "data": {
                "code": self.room_states[room_id]["code"],
                "language": self.room_states[room_id]["language"],
                "userCount": current_user_count,
                "connectedUsers": connected_users
            }
        }, websocket)
        
        # Notify ALL users (including the new one) about the updated user count
        await self.broadcast_to_room({
            "type": "user_joined",
            "roomId": room_id,
            "userId": user_id,
            "data": {
                "userCount": current_user_count,
                "connectedUsers": connected_users,
                "displayName": display_name
            }
        }, room_id)
        
        return user_id
    
    def disconnect(self, room_id: str, user_id: str):
        """Disconnect a user from a room"""
        if room_id in self.active_connections and user_id in self.active_connections[room_id]:
            del self.active_connections[room_id][user_id]
            if room_id in self.room_users and user_id in self.room_users[room_id]:
                del self.room_users[room_id][user_id]
            
            # Clean up empty rooms
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]
                if room_id in self.room_states:
                    del self.room_states[room_id]
                if room_id in self.room_users:
                    del self.room_users[room_id]
                if room_id in self.room_last_activity:
                    del self.room_last_activity[room_id]
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send a message to a specific websocket"""
        try:
            await websocket.send_text(json.dumps(message))
        except:
            pass  # Connection might be closed
    
    async def broadcast_to_room(self, message: dict, room_id: str, exclude_user: str = None):
        """Broadcast a message to all users in a room"""
        if room_id not in self.active_connections:
            return
        
        disconnected_users = []
        
        for user_id, websocket in self.active_connections[room_id].items():
            if exclude_user and user_id == exclude_user:
                continue
            
            try:
                await websocket.send_text(json.dumps(message))
            except:
                # Connection is closed, mark for removal
                disconnected_users.append(user_id)
        
        # Clean up disconnected users
        for user_id in disconnected_users:
            self.disconnect(room_id, user_id)
    
    async def handle_message(self, message: WebSocketMessage, user_id: str):
        """Handle incoming WebSocket messages"""
        room_id = message.roomId
        
        if message.type == "code_update":
            # Update room activity
            self.room_last_activity[room_id] = time.time()
            
            # Update room state
            if room_id in self.room_states and message.data:
                self.room_states[room_id]["code"] = message.data.get("code", "")
                if "language" in message.data:
                    self.room_states[room_id]["language"] = message.data["language"]
            
            # Broadcast to other users in the room
            await self.broadcast_to_room({
                "type": "code_update",
                "roomId": room_id,
                "userId": user_id,
                "data": message.data
            }, room_id, exclude_user=user_id)
        
        elif message.type == "cursor_update":
            # Broadcast cursor position to other users
            await self.broadcast_to_room({
                "type": "cursor_update",
                "roomId": room_id,
                "userId": user_id,
                "data": message.data
            }, room_id, exclude_user=user_id)
    
    def get_room_user_count(self, room_id: str) -> int:
        """Get the number of users in a room"""
        return len(self.active_connections.get(room_id, {}))
    
    def get_room_code(self, room_id: str) -> str:
        """Get the current code for a room"""
        return self.room_states.get(room_id, {}).get("code", "")
    
    async def cleanup_inactive_rooms(self):
        """Cleanup inactive rooms periodically"""
        while True:
            try:
                current_time = time.time()
                inactive_rooms = [
                    room_id for room_id, last_activity in self.room_last_activity.items()
                    if current_time - last_activity > self.room_timeout
                ]
                
                for room_id in inactive_rooms:
                    # Close all connections in inactive room
                    if room_id in self.active_connections:
                        for websocket in self.active_connections[room_id].values():
                            try:
                                await websocket.close(code=1000, reason="Room timeout")
                            except:
                                pass
                        del self.active_connections[room_id]
                    
                    # Clean up room data
                    if room_id in self.room_states:
                        del self.room_states[room_id]
                    if room_id in self.room_last_activity:
                        del self.room_last_activity[room_id]
                
                await asyncio.sleep(300)  # Check every 5 minutes
            except Exception as e:
                print(f"Cleanup error: {e}")
                await asyncio.sleep(60)


# Global WebSocket manager instance
websocket_manager = WebSocketManager()