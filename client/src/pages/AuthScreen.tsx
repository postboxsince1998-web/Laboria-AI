import React, { useState } from 'react';
import { AuthService } from '../services/authService';
import { Zap, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthScreenProps {
  onLogin: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = isLogin 
        ? await AuthService.login(username, password)
        : await AuthService.register(username, password);

      if (result.success) {
        onLogin();
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = async (userType: 'a' | 'b') => {
    setIsLoading(true);
    await AuthService.seedTestAccounts();
    const result = await AuthService.login(`testuser_${userType}`, 'password123');
    if (result.success) onLogin();
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-64 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-accent-teal/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-accent-teal flex items-center justify-center text-white shadow-glow">
            <Zap className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-display font-bold text-white tracking-tight">
          LABORIA <span className="text-brand-400">AI</span>
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Your private career operating system.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-panel p-8 shadow-xl rounded-2xl border border-gray-800">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-300">Username</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl focus:ring-brand-500 focus:border-brand-500 text-white placeholder-gray-500"
                  placeholder="Enter a unique username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl focus:ring-brand-500 focus:border-brand-500 text-white placeholder-gray-500"
                  placeholder="••••••••"
                />
              </div>
              <p className="mt-2 text-[11px] text-gray-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Secure SHA-256 Hashing. Never stored as plain text.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 focus:ring-offset-gray-900 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Create Secure Account')}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-950 text-gray-500">Security Isolation Tests</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDemo('a')}
                disabled={isLoading}
                className="w-full inline-flex flex-col items-center justify-center py-2 px-3 border border-brand-500/30 rounded-lg shadow-sm bg-brand-500/10 hover:bg-brand-500/20 text-xs font-medium text-brand-300 transition-colors"
              >
                <span className="font-semibold text-white">QA User A</span>
                <span className="text-[10px] text-gray-400">Data Analyst • Coimbatore</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemo('b')}
                disabled={isLoading}
                className="w-full inline-flex flex-col items-center justify-center py-2 px-3 border border-teal-500/30 rounded-lg shadow-sm bg-teal-500/10 hover:bg-teal-500/20 text-xs font-medium text-teal-300 transition-colors"
              >
                <span className="font-semibold text-white">QA User B</span>
                <span className="text-[10px] text-gray-400">MERN Dev • Bangalore</span>
              </button>
            </div>
          </div>
        </div>
        
        <p className="mt-4 text-center text-sm text-gray-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-brand-400 hover:text-brand-300 font-medium">
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};
