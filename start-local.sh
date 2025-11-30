#!/bin/bash

echo "🚀 Starting Real-time Pair Programming App Locally"
echo "================================================="

# Kill any existing processes
pkill -f "uvicorn\|npm start\|python.*main.py"

# Start backend
echo "Starting backend..."
cd backend
python3 main.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "Starting frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Services started!"
echo ""
echo "🌐 Access your app at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo ""
echo "📱 To test multi-user collaboration:"
echo "   1. Open http://localhost:3000 in multiple browser tabs"
echo "   2. Create a room in one tab"
echo "   3. Join the same room from other tabs"
echo "   4. Start typing and see real-time sync!"
echo ""
echo "🛑 To stop: Ctrl+C or run: pkill -f 'uvicorn\\|npm start'"

# Keep script running
wait