import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import {
  setRoomId,
  setLanguage,
  setConnected,
  setCode,
  setUserCount,
  setConnectedUsers,
} from '../store/roomSlice';
import { createRoom } from '../services/api';
import { websocketService } from '../services/websocket';

const RoomControls: React.FC<{
  showSnackbar: boolean;
  setShowSnackbar: (show: boolean) => void;
  isDark: boolean;
  showNotification: (message: string, type?: 'success' | 'error') => void;
}> = ({ showSnackbar, setShowSnackbar, isDark, showNotification }) => {
  const dispatch = useDispatch();
  const {
    roomId,
    language,
    isConnected,
    userCount,
    displayName,
    connectedUsers,
  } = useSelector((state: RootState) => state.room);
  const [inputRoomId, setInputRoomId] = useState('');
  const [showUserNames, setShowUserNames] = useState(false);

  const handleCreateRoom = async () => {
    try {
      const room = await createRoom(language);
      dispatch(setRoomId(room.roomId));
      setInputRoomId(room.roomId);
      setTimeout(() => {
        handleJoinRoom(room.roomId);
      }, 500);
    } catch (error) {
      showNotification(`Failed to create room: ${error}`, 'error');
    }
  };

  const handleJoinRoom = (roomIdToJoin?: string) => {
    const targetRoomId = roomIdToJoin || inputRoomId || roomId;
    if (!targetRoomId) {
      showNotification('Please enter a room ID', 'error');
      return;
    }

    if (isConnected) {
      websocketService.disconnect();
    }

    websocketService.connect(
      targetRoomId,
      displayName,
      message => {
        switch (message.type) {
          case 'code_sync':
          case 'code_update':
            if (message.data?.code !== undefined) {
              dispatch(setCode(message.data.code));
            }
            break;
          case 'user_joined':
          case 'user_left':
            if (message.data?.userCount !== undefined) {
              dispatch(setUserCount(message.data.userCount));
            }
            if (message.data?.connectedUsers) {
              dispatch(setConnectedUsers(message.data.connectedUsers));
            }
            break;
          case 'room_state':
            dispatch(setConnected(true));
            dispatch(setRoomId(targetRoomId));
            if (message.data?.code !== undefined) {
              dispatch(setCode(message.data.code));
            }
            if (message.data?.userCount !== undefined) {
              dispatch(setUserCount(message.data.userCount));
            }
            if (message.data?.connectedUsers) {
              dispatch(setConnectedUsers(message.data.connectedUsers));
            }
            break;
        }
      },
      () => {},
      () => {
        dispatch(setConnected(false));
        dispatch(setUserCount(0));
      }
    );
  };

  const handleDisconnect = () => {
    websocketService.disconnect();
  };

  return (
    <div
      className={`p-4 rounded-2xl shadow-xl transition-all duration-300 ${
        isDark
          ? 'bg-slate-700/50 border border-slate-600/50'
          : 'bg-white/90 border border-gray-200 shadow-gray-200/50'
      }`}
    >
      <div className="space-y-3">
        <div
          className={`flex items-center gap-2 text-xs mb-3 p-2 rounded-xl ${
            isDark ? 'bg-slate-600/30' : 'bg-gray-50'
          }`}
        >
          <div
            className={`w-3 h-3 rounded-full shadow-lg ${isConnected ? 'bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse' : 'bg-gray-500'}`}
          ></div>
          <div
            className={`font-medium ${
              isDark ? 'text-gray-200' : 'text-gray-700'
            }`}
          >
            {isConnected ? (
              <>
                <div>
                  Connected to{' '}
                  <span className="font-mono text-purple-400">{roomId}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 text-xs">
                      {showUserNames
                        ? `${userCount} users: ${connectedUsers.join(', ')}`
                        : `${userCount} users`}
                    </span>
                    {userCount > 0 && (
                      <button
                        onClick={() => setShowUserNames(!showUserNames)}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          isDark
                            ? 'bg-white/10 text-gray-300 hover:bg-white/20'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                        title={
                          showUserNames ? 'Hide user names' : 'Show user names'
                        }
                      >
                        {showUserNames ? (
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                              clipRule="evenodd"
                            />
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                          </svg>
                        ) : (
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="flex">
                    <button
                      onClick={() => {
                        if (roomId) {
                          navigator.clipboard.writeText(roomId);
                          showNotification(
                            'Room ID copied to clipboard!',
                            'success'
                          );
                        }
                      }}
                      className={`p-1 rounded transition-colors ${
                        isDark
                          ? 'hover:bg-white/10 text-gray-400 hover:text-white'
                          : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                      }`}
                      title="Copy Room ID"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                        <path d="M3 5a2 2 0 012-2 3 3 0 003 3h6a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11.586l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L11 11.586V16a1 1 0 102 0v-4.414l1.293 1.293A1 1 0 0015 11.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        if (roomId) {
                          const subject = 'Join my coding room';
                          const body = `Join my collaborative coding session!\n\nRoom ID: ${roomId}\nURL: ${window.location.origin}\n\nJust paste the Room ID and click "Join Room"`;
                          window.open(
                            `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
                          );
                        }
                      }}
                      className={`p-1 rounded transition-colors ${
                        isDark
                          ? 'hover:bg-white/10 text-gray-400 hover:text-white'
                          : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                      }`}
                      title="Share via Email"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              'Not connected'
            )}
          </div>
        </div>

        <input
          type="text"
          value={inputRoomId}
          onChange={e => {
            if (isConnected) {
              setShowSnackbar(true);
              setTimeout(() => setShowSnackbar(false), 3000);
              return;
            }
            setInputRoomId(e.target.value);
          }}
          placeholder="Enter Room ID"
          className={`w-full px-4 py-3 text-sm rounded-2xl backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:scale-[1.02] ${isConnected ? 'cursor-not-allowed opacity-60' : ''} ${
            isDark
              ? 'bg-white/10 border border-white/20 text-white placeholder-gray-400 hover:bg-white/15'
              : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
        />

        <div className="relative">
          <select
            value={language}
            onChange={e => {
              if (isConnected) {
                setShowSnackbar(true);
                setTimeout(() => setShowSnackbar(false), 3000);
                return;
              }
              dispatch(setLanguage(e.target.value));
            }}
            className={`w-full px-4 py-3 pr-10 text-sm rounded-2xl backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:scale-[1.02] appearance-none ${isConnected ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${
              isDark
                ? 'bg-white/10 border border-white/20 text-white hover:bg-white/15'
                : 'bg-gray-50 border border-gray-300 text-gray-900'
            }`}
          >
            <option
              value="python"
              style={{
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                color: isDark ? '#ffffff' : '#1f2937',
                padding: '8px 12px',
              }}
            >
              Python
            </option>
            <option
              value="cpp"
              style={{
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                color: isDark ? '#ffffff' : '#1f2937',
                padding: '8px 12px',
              }}
            >
              C++
            </option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleCreateRoom}
            disabled={isConnected}
            className={`w-full px-3 py-2 text-xs font-medium rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
              isDark
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-blue-500/25 backdrop-blur-sm'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-blue-500/25'
            }`}
          >
            Create Room
          </button>
          <button
            onClick={() => handleJoinRoom()}
            disabled={isConnected}
            className={`w-full px-3 py-2 text-xs font-medium rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
              isDark
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-green-500/25 backdrop-blur-sm'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-green-500/25'
            }`}
          >
            Join Room
          </button>
        </div>

        <button
          onClick={handleDisconnect}
          disabled={!isConnected}
          className={`w-full px-3 py-2 text-xs font-medium rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
            isDark
              ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg hover:shadow-red-500/25 backdrop-blur-sm'
              : 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg hover:shadow-red-500/25'
          }`}
        >
          Leave Room
        </button>
      </div>
    </div>
  );
};

const Snackbar: React.FC<{ show: boolean }> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-slate-800 border border-red-500/30 text-white px-4 py-3 rounded-xl shadow-2xl z-[9999] transform transition-all duration-300 ease-out animate-in slide-in-from-right-5">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium">
          Disconnect from current room first
        </span>
      </div>
    </div>
  );
};

const NotificationSnackbar: React.FC<{
  show: boolean;
  message: string;
  type: 'success' | 'error';
}> = ({ show, message, type }) => {
  if (!show) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-2xl z-[9999] transform transition-all duration-300 ease-out animate-in slide-in-from-right-5 ${
        type === 'success'
          ? 'bg-green-600 border border-green-500/30'
          : 'bg-red-600 border border-red-500/30'
      } text-white`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-2 h-2 rounded-full animate-pulse ${
            type === 'success' ? 'bg-green-400' : 'bg-red-400'
          }`}
        ></div>
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
};

const RoomControlsWithSnackbar: React.FC<{ isDark: boolean }> = ({
  isDark,
}) => {
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });

  const showNotification = (
    message: string,
    type: 'success' | 'error' = 'success'
  ) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
  };

  return (
    <>
      <RoomControls
        showSnackbar={showSnackbar}
        setShowSnackbar={setShowSnackbar}
        isDark={isDark}
        showNotification={showNotification}
      />
      <Snackbar show={showSnackbar} />
      <NotificationSnackbar
        show={notification.show}
        message={notification.message}
        type={notification.type}
      />
    </>
  );
};

export default RoomControlsWithSnackbar;
