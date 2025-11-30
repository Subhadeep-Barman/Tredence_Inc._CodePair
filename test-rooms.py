#!/usr/bin/env python3
"""
Quick test script to verify room creation and WebSocket functionality
"""
import requests
import json
import asyncio
import websockets
import sys

BASE_URL = "http://localhost:8000"

async def test_room_functionality():
    print("🧪 Testing Room Functionality")
    print("=" * 40)
    
    # Test 1: Create a room
    print("1. Creating a room...")
    try:
        response = requests.post(f"{BASE_URL}/api/rooms", 
                               json={"language": "python"})
        if response.status_code == 200:
            room_data = response.json()
            room_id = room_data["roomId"]
            print(f"✅ Room created: {room_id}")
        else:
            print(f"❌ Failed to create room: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Error creating room: {e}")
        return
    
    # Test 2: Connect to WebSocket
    print(f"2. Connecting to WebSocket for room {room_id}...")
    try:
        uri = f"ws://localhost:8000/ws/{room_id}"
        async with websockets.connect(uri) as websocket:
            print("✅ WebSocket connected")
            
            # Wait for initial messages
            try:
                message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                data = json.loads(message)
                print(f"📨 Received: {data['type']} - User count: {data.get('data', {}).get('userCount', 'N/A')}")
                
                # Send a code update
                code_update = {
                    "type": "code_update",
                    "roomId": room_id,
                    "data": {
                        "code": "print('Hello from test!')",
                        "language": "python"
                    }
                }
                await websocket.send(json.dumps(code_update))
                print("✅ Sent code update")
                
                print("✅ Room functionality test passed!")
                
            except asyncio.TimeoutError:
                print("⚠️  No initial message received (timeout)")
                
    except Exception as e:
        print(f"❌ WebSocket error: {e}")

def test_api_endpoints():
    print("\n🔍 Testing API Endpoints")
    print("=" * 40)
    
    # Test health endpoint
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health endpoint working")
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health endpoint error: {e}")
    
    # Test autocomplete endpoint
    try:
        response = requests.post(f"{BASE_URL}/api/autocomplete", 
                               json={
                                   "code": "def ",
                                   "cursorPosition": 4,
                                   "language": "python"
                               })
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Autocomplete working: '{data['suggestion']}'")
        else:
            print(f"❌ Autocomplete failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Autocomplete error: {e}")

if __name__ == "__main__":
    print("🚀 Real-time Pair Programming - Room Test")
    print("=" * 50)
    
    # Test API endpoints first
    test_api_endpoints()
    
    # Test WebSocket functionality
    try:
        asyncio.run(test_room_functionality())
    except KeyboardInterrupt:
        print("\n👋 Test interrupted by user")
    
    print("\n📋 Manual Testing Instructions:")
    print("1. Open multiple browser tabs to http://localhost:3000")
    print("2. Create a room in one tab")
    print("3. Join the same room from other tabs")
    print("4. Start typing and verify real-time sync")
    print("5. Check user count updates when users join/leave")