# Real-time Pair Programming Backend

A FastAPI-based backend for a collaborative code editor with real-time synchronization and AI-style autocomplete functionality.

## Features

- **Real-time Collaboration**: Multiple users can edit code simultaneously using WebSockets
- **Room Management**: Create and join coding rooms with unique IDs
- **AI Autocomplete**: Real AI-powered code suggestions using OpenAI GPT
- **PostgreSQL Database**: Persistent storage for rooms and code content
- **Clean Architecture**: Organized with routers, services, models, and schemas

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **WebSockets**: Real-time bidirectional communication
- **PostgreSQL**: Reliable relational database
- **SQLAlchemy**: Async ORM for database operations
- **Pydantic**: Data validation and serialization

## Project Structure

```
backend/
├── app/
│   ├── models/          # Database models
│   ├── schemas/         # Pydantic schemas for request/response
│   ├── routers/         # API route handlers
│   ├── services/        # Business logic layer
│   ├── config.py        # Configuration settings
│   └── database.py      # Database setup and connection
├── main.py              # FastAPI application entry point
├── requirements.txt     # Python dependencies
└── .env.example         # Environment variables template
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- PostgreSQL 12+

### Installation

1. **Clone the repository and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\\Scripts\\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and OpenAI API key
   ```

5. **Set up PostgreSQL database**
   ```sql
   CREATE DATABASE pair_programming_db;
   CREATE USER username WITH PASSWORD 'password';
   GRANT ALL PRIVILEGES ON DATABASE pair_programming_db TO username;
   ```

6. **Run the application**
   ```bash
   python main.py
   ```

The API will be available at `http://localhost:8000`

## API Endpoints

### REST Endpoints

- `POST /api/rooms` - Create a new room
- `GET /api/rooms/{room_id}` - Get room information
- `POST /api/autocomplete` - Get AI autocomplete suggestions
- `GET /ws/rooms/{room_id}/status` - Get room status

### WebSocket Endpoint

- `WS /ws/{room_id}` - Real-time collaboration endpoint

## WebSocket Message Format

```json
{
  "type": "code_update|cursor_update|join_room",
  "roomId": "room_id",
  "userId": "user_id",
  "data": {
    "code": "code_content",
    "cursorPosition": 123,
    "language": "python"
  }
}
```

## Usage Examples

### Create a Room
```bash
curl -X POST "http://localhost:8000/api/rooms" \\
     -H "Content-Type: application/json" \\
     -d '{"language": "python"}'
```

### Get Autocomplete Suggestion
```bash
curl -X POST "http://localhost:8000/api/autocomplete" \\
     -H "Content-Type: application/json" \\
     -d '{
       "code": "def hello_",
       "cursorPosition": 10,
       "language": "python"
     }'
```

### WebSocket Connection (JavaScript)
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/room123');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'join_room',
    roomId: 'room123',
    data: {}
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};
```

## Architecture Decisions

### 1. **Layered Architecture**
- **Routers**: Handle HTTP requests and WebSocket connections
- **Services**: Contain business logic and coordinate between layers
- **Models**: Define database schema using SQLAlchemy
- **Schemas**: Validate and serialize data using Pydantic

### 2. **WebSocket Management**
- In-memory storage for active connections and room states
- Automatic cleanup of disconnected users
- Broadcast messaging for real-time synchronization

### 3. **Database Design**
- Simple Room model with code persistence
- Async SQLAlchemy for non-blocking database operations
- Automatic timestamp tracking for created/updated times

### 4. **Autocomplete Service**
- Real AI-powered suggestions using OpenAI GPT-3.5-turbo
- Context-aware code completion based on surrounding code
- Fallback to pattern-based suggestions when OpenAI is unavailable
- Confidence scoring for suggestions

## Limitations

1. **In-Memory State**: Room states are stored in memory and will be lost on server restart
2. **Simple Conflict Resolution**: Uses "last-write-wins" approach for code synchronization
3. **No Authentication**: No user authentication or authorization implemented
4. **OpenAI Dependency**: Requires OpenAI API key for best AI suggestions (fallback available)
5. **No Persistence**: WebSocket room states are not persisted to database
6. **Single Server**: No horizontal scaling support for WebSocket connections

## Future Improvements

Given more time, I would implement:

1. **Operational Transform (OT)**: Better conflict resolution for simultaneous edits
2. **Redis Integration**: Persistent storage for room states and session management
3. **User Authentication**: JWT-based authentication system
4. **Enhanced AI Models**: Upgrade to more advanced models like GPT-4 or Codex
5. **Rate Limiting**: Prevent abuse of API endpoints
6. **Comprehensive Testing**: Unit and integration tests
7. **Docker Support**: Containerization for easy deployment
8. **Monitoring**: Logging, metrics, and health checks
9. **Code Execution**: Ability to run code within the editor
10. **File Management**: Support for multiple files per room

## Testing

You can test the API using:

1. **FastAPI Interactive Docs**: Visit `http://localhost:8000/docs`
2. **Postman**: Import the API endpoints for testing
3. **WebSocket Client**: Use any WebSocket client to test real-time features

## Development

For development, the application runs with auto-reload enabled. The database tables are automatically created on startup.

To see SQL queries in development, set `ENVIRONMENT=development` in your `.env` file.