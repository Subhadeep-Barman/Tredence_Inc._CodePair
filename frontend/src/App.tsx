import React, { useState } from 'react';
import { Provider, useSelector } from 'react-redux';
import { store, RootState } from './store';
import RoomControls from './components/RoomControls';
import CodeEditor from './components/CodeEditor';
import AuthModal from './components/AuthModal';

const AppContent: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const { isAuthenticated } = useSelector((state: RootState) => state.room);

  if (!isAuthenticated) {
    return (
      <div
        className={`h-screen overflow-hidden transition-colors duration-300 ${
          isDark
            ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900'
            : 'bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100'
        }`}
      >
        <AuthModal isDark={isDark} />
      </div>
    );
  }

  return (
    <div
      className={`h-screen overflow-hidden transition-colors duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900'
          : 'bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100'
      }`}
    >
      <div className="h-full flex flex-col md:flex-row">
        {/* Mobile Header */}
        <div className={`md:hidden flex items-center justify-between p-4 ${
          isDark ? 'bg-slate-800/50' : 'bg-white/90'
        }`}>
          <h1
            className={`text-xl font-bold tracking-tight ${
              isDark ? 'text-white drop-shadow-lg' : 'text-gray-900'
            }`}
          >
            Pair
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Code
            </span>
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-xl transition-all duration-300 ${
                isDark
                  ? 'bg-slate-700/50 text-white hover:bg-slate-600/50'
                  : 'bg-white text-gray-800 hover:bg-gray-100 shadow-lg'
              }`}
            >
              {isDark ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className={`p-2 rounded-xl transition-all duration-300 ${
                isDark
                  ? 'bg-slate-700/50 text-white hover:bg-slate-600/50'
                  : 'bg-white text-gray-800 hover:bg-gray-100 shadow-lg'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Left Sidebar */}
        <div
          className={`${showSidebar ? 'fixed inset-0 z-50 flex' : 'hidden'} md:flex md:relative md:w-64 flex-col p-4 ${
            isDark
              ? 'bg-slate-800/95 md:bg-slate-800/50'
              : 'bg-white/95 md:bg-white/90'
          }`}
        >
          {/* Close button for mobile */}
          <button
            onClick={() => setShowSidebar(false)}
            className={`md:hidden absolute top-4 right-4 p-2 rounded-xl ${
              isDark ? 'bg-slate-700 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          <header className="flex items-center justify-between mb-6 flex-shrink-0">
            <h1
              className={`text-2xl font-bold tracking-tight ${
                isDark ? 'text-white drop-shadow-lg' : 'text-gray-900'
              }`}
            >
              Pair
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Code
              </span>
            </h1>
            <button
              onClick={() => setIsDark(!isDark)}
              className={`hidden md:block p-3 rounded-2xl transition-all duration-300 hover:scale-105 ${
                isDark
                  ? 'bg-slate-700/50 text-white hover:bg-slate-600/50'
                  : 'bg-white text-gray-800 hover:bg-gray-100 shadow-lg'
              }`}
            >
              {isDark ? (
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </header>

          <div className="flex-1 overflow-y-auto">
            <RoomControls isDark={isDark} onRoomAction={() => setShowSidebar(false)} />
          </div>

          <footer
            className={`flex-shrink-0 text-center text-xs mt-6 ${
              isDark ? 'text-gray-400/80' : 'text-gray-400'
            }`}
          >
            <div
              className={`inline-block px-3 py-1 rounded-full ${
                isDark ? 'bg-slate-700/50' : 'bg-gray-100'
              }`}
            >
              Built by Subhadeep Barman
            </div>
          </footer>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 p-1 md:p-4">
          <CodeEditor isDark={isDark} />
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
