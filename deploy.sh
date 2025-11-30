#!/bin/bash

echo "🚀 Deploying Real-time Pair Programming App"
echo "=========================================="

# Stop any existing containers
docker-compose down

# Build and start services
docker-compose up --build -d

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Access your app at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   Nginx Proxy: http://localhost:80"
echo ""
echo "📱 To test multi-user collaboration:"
echo "   1. Open http://localhost:3000 in multiple browser tabs/windows"
echo "   2. Create a room in one tab"
echo "   3. Copy the room ID and join from other tabs"
echo "   4. Start typing and see real-time sync!"
echo ""
echo "🔍 View logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Stop deployment:"
echo "   docker-compose down"