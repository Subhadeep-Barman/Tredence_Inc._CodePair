export interface Room {
  roomId: string;
  language: string;
  created_at: string;
}

export interface WebSocketMessage {
  type: string;
  roomId: string;
  userId?: string;
  data?: any;
}

export interface AutocompleteRequest {
  code: string;
  cursorPosition: number;
  language: string;
}

export interface AutocompleteResponse {
  suggestion: string;
  insertPosition: number;
  confidence: number;
}
