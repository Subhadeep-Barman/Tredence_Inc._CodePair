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

  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsMoving(true);
      
      // Create particle effect on mouse move
      const particle = document.createElement('div');
      particle.className = 'cursor-particle';
      particle.style.left = `${e.clientX}px`;
      particle.style.top = `${e.clientY}px`;
      document.body.appendChild(particle);
      
      setTimeout(() => {
        particle.remove();
      }, 1000);
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIsMoving(false), 150);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Interactive cursor trail background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-slate-950 to-gray-950">
        {/* Animated mesh grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000,transparent)]"></div>
        </div>
        
        {/* Multi-layered cursor glow effect */}
        <div 
          className="absolute w-[800px] h-[800px] rounded-full opacity-40 blur-3xl transition-all duration-500 ease-out pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.6) 0%, rgba(236, 72, 153, 0.4) 30%, rgba(59, 130, 246, 0.3) 60%, transparent 80%)',
            left: `${mousePosition.x - 400}px`,
            top: `${mousePosition.y - 400}px`,
            transform: isMoving ? 'scale(1.2)' : 'scale(1)',
          }}
        ></div>
        
        {/* Inner intense glow */}
        <div 
          className="absolute w-[300px] h-[300px] rounded-full opacity-50 blur-2xl transition-all duration-200 ease-out pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.8) 0%, rgba(168, 85, 247, 0.6) 40%, transparent 70%)',
            left: `${mousePosition.x - 150}px`,
            top: `${mousePosition.y - 150}px`,
            transform: isMoving ? 'scale(1.3)' : 'scale(1)',
          }}
        ></div>
        
        {/* Animated ripple rings */}
        <div 
          className="absolute w-32 h-32 rounded-full border-2 border-purple-400/40 pointer-events-none animate-ping-slow"
          style={{
            left: `${mousePosition.x - 64}px`,
            top: `${mousePosition.y - 64}px`,
            opacity: isMoving ? 0.6 : 0,
          }}
        ></div>
        <div 
          className="absolute w-24 h-24 rounded-full border-2 border-pink-400/50 pointer-events-none animate-ping-slower"
          style={{
            left: `${mousePosition.x - 48}px`,
            top: `${mousePosition.y - 48}px`,
            opacity: isMoving ? 0.7 : 0,
          }}
        ></div>
        
        {/* Animated 3D orbs with parallax effect */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Floating sparkles */}
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-sparkle opacity-60"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-300 rounded-full animate-sparkle animation-delay-2000 opacity-50"></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-pink-300 rounded-full animate-sparkle animation-delay-3000 opacity-60"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-cyan-300 rounded-full animate-sparkle animation-delay-4000 opacity-50"></div>
        <div className="absolute top-2/3 left-2/3 w-1 h-1 bg-white rounded-full animate-sparkle animation-delay-1000 opacity-60"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-md w-full mx-4">
        {/* Floating 3D elements with depth */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-float-3d"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl animate-float-3d animation-delay-2000"></div>
        <div className="absolute top-1/2 -right-16 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-2xl animate-float animation-delay-3000"></div>
        
        {/* Glass card with 3D transform */}
        <div className="relative backdrop-blur-2xl bg-gray-900/80 border border-white/30 rounded-[2rem] shadow-2xl p-8 transform hover:scale-[1.02] transition-all duration-500 hover:shadow-purple-500/30 hover:shadow-3xl" style={{ transformStyle: 'preserve-3d' }}>
          {/* Heading - text only, no icon */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-3 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent tracking-tight">
              CodePair
            </h1>
            <p className="text-gray-200 text-lg">
              Real-time collaborative coding
            </p>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Live sync</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>AI powered</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="group">
              <label className="block text-sm font-medium mb-2 text-gray-100">
                Display Name
              </label>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-all duration-300"></div>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="relative w-full px-5 py-4 bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 text-white placeholder-gray-400 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-purple-400/50 focus:bg-gray-800/80 hover:bg-gray-800/70"
                  maxLength={20}
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium mb-2 text-gray-100">
                Verify you're human: {captcha.split('=')[0]}= ?
              </label>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-all duration-300"></div>
                <input
                  type="number"
                  value={captcha.split('=')[1]?.trim() || ''}
                  onChange={e =>
                    setCaptcha(captcha.split('=')[0] + '= ' + e.target.value)
                  }
                  placeholder="Answer"
                  className="relative w-full px-5 py-4 bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 text-white placeholder-gray-400 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-purple-400/50 focus:bg-gray-800/80 hover:bg-gray-800/70"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-900/40 border border-red-500/50 rounded-2xl p-4 backdrop-blur-sm animate-shake">
                <p className="text-red-300 text-sm flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              className="relative w-full group overflow-hidden rounded-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-[length:200%_100%] animate-gradient-x"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div className="relative py-4 px-6 text-white font-bold rounded-2xl transition-all duration-300 group-hover:scale-[1.02] flex items-center justify-center gap-2 group-hover:shadow-xl group-hover:shadow-purple-500/50">
                <span className="text-lg">Start Coding</span>
                <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-gray-400 text-sm">
              Built with ❤️ by <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-semibold">Subhadeep Barman</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
