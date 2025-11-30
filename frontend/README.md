# Pair Programming Frontend

Minimal React + TypeScript + Redux frontend for real-time collaborative coding.

## Features

- **Real-time Collaboration**: Live code synchronization via WebSockets
- **Room Management**: Create and join coding rooms
- **AI Autocomplete**: Get code suggestions
- **Redux State Management**: Centralized state with Redux Toolkit
- **TypeScript**: Type-safe development

## Quick Start

```bash
cd frontend
npm install
npm start
```

The app will open at `http://localhost:3000`

## Usage

1. **Create Room**: Click "Create Room" to generate a new room
2. **Join Room**: Enter room ID and click "Join Room"
3. **Code Together**: Start typing - changes sync in real-time
4. **Get Suggestions**: Click "Get Suggestion" for AI autocomplete

## Architecture

- **Redux Store**: Manages room state, connection status, code content
- **WebSocket Service**: Handles real-time communication
- **API Service**: REST API calls for room creation and autocomplete
- **Components**: Minimal UI components for editor and controls

## Components

- `App.tsx` - Main application component
- `RoomControls.tsx` - Room management and connection controls
- `CodeEditor.tsx` - Code editor with autocomplete functionality