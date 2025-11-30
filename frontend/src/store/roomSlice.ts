import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RoomState {
  roomId: string | null;
  code: string;
  language: string;
  isConnected: boolean;
  userCount: number;
  suggestion: string | null;
  isAuthenticated: boolean;
  displayName: string;
  connectedUsers: string[];
}

const initialState: RoomState = {
  roomId: null,
  code: '',
  language: 'python',
  isConnected: false,
  userCount: 0,
  suggestion: null,
  isAuthenticated: false,
  displayName: '',
  connectedUsers: [],
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setRoomId: (state, action: PayloadAction<string>) => {
      state.roomId = action.payload;
    },
    setCode: (state, action: PayloadAction<string>) => {
      state.code = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setUserCount: (state, action: PayloadAction<number>) => {
      state.userCount = action.payload;
    },
    setSuggestion: (state, action: PayloadAction<string | null>) => {
      state.suggestion = action.payload;
    },
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setDisplayName: (state, action: PayloadAction<string>) => {
      state.displayName = action.payload;
    },
    setConnectedUsers: (state, action: PayloadAction<string[]>) => {
      state.connectedUsers = action.payload;
    },
  },
});

export const {
  setRoomId,
  setCode,
  setLanguage,
  setConnected,
  setUserCount,
  setSuggestion,
  setAuthenticated,
  setDisplayName,
  setConnectedUsers,
} = roomSlice.actions;
export default roomSlice.reducer;
