import { WebSocketMessage } from '../types';

// Get WebSocket URL based on environment
const getWebSocketUrl = (): string => {
  const wsUrl = process.env.REACT_APP_WS_URL;
  if (wsUrl) {
    return wsUrl;
  }
  
  // Fallback: construct from current location
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}`;
};

export class WebSocketService {
  private ws: WebSocket | null = null;
  private roomId: string | null = null;
  private onMessage: (message: WebSocketMessage) => void = () => {};
  private onConnect: () => void = () => {};
  private onDisconnect: () => void = () => {};

  connect(
    roomId: string,
    displayName: string,
    onMessage: (message: WebSocketMessage) => void,
    onConnect: () => void,
    onDisconnect: () => void
  ) {
    this.roomId = roomId;
    this.onMessage = onMessage;
    this.onConnect = onConnect;
    this.onDisconnect = onDisconnect;

    const wsBaseUrl = getWebSocketUrl();
    const wsUrl = `${wsBaseUrl}/ws/${roomId}?display_name=${encodeURIComponent(displayName)}`;
    
    console.log('Connecting to WebSocket:', wsUrl);
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected to room:', roomId, 'as', displayName);
      this.onConnect();
      // Send join message is handled automatically by the backend
    };

    this.ws.onmessage = event => {
      try {
        const message = JSON.parse(event.data);
        this.onMessage(message);
      } catch (error) {
        console.error('Invalid WebSocket message:', event.data);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.onDisconnect();
    };
  }

  send(message: WebSocketMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const websocketService = new WebSocketService();
