import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setAuthenticated, setDisplayName } from '../store/roomSlice';

interface AuthModalProps {
  isDark: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({ isDark }) => {
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState(0);
  const [error, setError] = useState('');

  // Generate simple math captcha
  React.useEffect(() => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setCaptchaAnswer(a + b);
    setCaptcha(`${a} + ${b} = ?`);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter your display name');
      return;
    }

    if (parseInt(captcha.split('=')[1]?.trim() || '0') !== captchaAnswer) {
      setError('Please solve the math problem correctly');
      return;
    }

    dispatch(setDisplayName(name.trim()));
    dispatch(setAuthenticated(true));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className={`max-w-md w-full mx-4 p-6 rounded-2xl shadow-2xl ${
          isDark
            ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-white/20'
            : 'bg-white border border-gray-200'
        }`}
      >
        <div className="text-center mb-6">
          <h2
            className={`text-2xl font-bold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            Welcome to PairCode
          </h2>
          <p
            className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
          >
            Enter your display name to start collaborating
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
              className={`w-full px-4 py-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                isDark
                  ? 'bg-white/10 border border-white/20 text-white placeholder-gray-400'
                  : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              maxLength={20}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Verify you're human: {captcha.split('=')[0]}= ?
            </label>
            <input
              type="number"
              value={captcha.split('=')[1]?.trim() || ''}
              onChange={e =>
                setCaptcha(captcha.split('=')[0] + '= ' + e.target.value)
              }
              placeholder="Answer"
              className={`w-full px-4 py-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
                isDark
                  ? 'bg-white/10 border border-white/20 text-white placeholder-gray-400'
                  : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium rounded-xl hover:scale-105 transition-all duration-300 shadow-lg"
          >
            Start Coding
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
