#!/usr/bin/env python3
"""
Simple test script to demonstrate the API functionality
Run this after starting the server to test basic functionality
"""

import asyncio
import json
import requests
import websockets
from datetime import datetime


BASE_URL = "http://localhost:8000"
WS_URL = "ws://localhost:8000"


def test_create_room():
    """Test room creation"""
    print("🏠 Testing room creation...")
    
    response = requests.post(f"{BASE_URL}/api/rooms", json={"language": "python"})
    
    if response.status_code == 200:
        room_data = response.json()
        print(f"✅ Room created successfully: {room_data['roomId']}")
        return room_data['roomId']
    else:
        print(f"❌ Failed to create room: {response.text}")
        return None


def test_get_room(room_id):
    """Test getting room information"""
    print(f"📋 Testing get room info for {room_id}...")
    
    response = requests.get(f"{BASE_URL}/api/rooms/{room_id}")
    
    if response.status_code == 200:
        room_data = response.json()
        print(f"✅ Room info retrieved: {room_data}")
        return True
    else:
        print(f"❌ Failed to get room info: {response.text}")
        return False


def test_autocomplete():
    """Test autocomplete functionality"""
    print("🤖 Testing autocomplete...")
    
    test_cases = [
        {
            "code": "def hello_",
            "cursorPosition": 10,
            "language": "python"
        },
        {
            "code": "for i in ",
            "cursorPosition": 8,
            "language": "python"
        },
        {
            "code": "import ",
            "cursorPosition": 7,
            "language": "python"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        response = requests.post(f"{BASE_URL}/api/autocomplete", json=test_case)
        
        if response.status_code == 200:
            suggestion = response.json()
            print(f"✅ Test {i}: '{test_case['code']}' -> '{suggestion['suggestion']}'")
        else:
            print(f"❌ Test {i} failed: {response.text}")


async def test_websocket(room_id):
    """Test WebSocket functionality"""
    print(f"🔌 Testing WebSocket connection for room {room_id}...")
    
    try:
        uri = f"{WS_URL}/ws/{room_id}"
        async with websockets.connect(uri) as websocket:
            print("✅ WebSocket connected successfully")
            
            # Send a join room message
            join_message = {
                "type": "join_room",
                "roomId": room_id,
                "data": {}
            }
            await websocket.send(json.dumps(join_message))
            print("📤 Sent join room message")
            
            # Send a code update
            code_update = {
                "type": "code_update",
                "roomId": room_id,
                "data": {
                    "code": "print('Hello from WebSocket!')",
                    "language": "python"
                }
            }
            await websocket.send(json.dumps(code_update))
            print("📤 Sent code update")
            
            # Listen for responses (with timeout)
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=2.0)
                message = json.loads(response)
                print(f"📥 Received: {message}")
            except asyncio.TimeoutError:
                print("⏰ No response received (timeout)")
            
            print("✅ WebSocket test completed")
            
    except Exception as e:
        print(f"❌ WebSocket test failed: {e}")


def test_health_check():
    """Test health check endpoint"""
    print("❤️ Testing health check...")
    
    response = requests.get(f"{BASE_URL}/health")
    
    if response.status_code == 200:
        print("✅ Health check passed")
        return True
    else:
        print(f"❌ Health check failed: {response.text}")
        return False


async def main():
    """Run all tests"""
    print("🚀 Starting API tests...")
    print(f"📍 Base URL: {BASE_URL}")
    print(f"🕐 Time: {datetime.now()}")
    print("-" * 50)
    
    # Test health check first
    if not test_health_check():
        print("❌ Server is not running or not healthy. Please start the server first.")
        return
    
    print()
    
    # Test room creation
    room_id = test_create_room()
    if not room_id:
        print("❌ Cannot continue without a room ID")
        return
    
    print()
    
    # Test getting room info
    test_get_room(room_id)
    print()
    
    # Test autocomplete
    test_autocomplete()
    print()
    
    # Test WebSocket
    await test_websocket(room_id)
    print()
    
    print("-" * 50)
    print("🎉 All tests completed!")
    print(f"🔗 You can also test manually at: {BASE_URL}/docs")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 Tests interrupted by user")
    except Exception as e:
        print(f"\n❌ Test runner error: {e}")