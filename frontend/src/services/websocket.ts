import { WebSocketMessage } from '../types';

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

    this.ws = new WebSocket(
      `ws://localhost:8000/ws/${roomId}?display_name=${encodeURIComponent(displayName)}`
    );

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

    this.ws.onclose = () => {
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
