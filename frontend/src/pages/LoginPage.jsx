import React, { useState } from 'react';
import { Heart, User, KeyRound, Sparkles, ArrowLeft, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CONFIG } from '../config';

export const LoginPage = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [mode, setMode] = useState(() => new URLSearchParams(window.location.search).get('resetToken') ? 'reset' : 'login');
  const [message, setMessage] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your password.');
    } finally {
      setLoading(false);
    }
  };

  const requestReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setResetUrl('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not request a reset link.');
      setMessage(data.message);
      setResetUrl(data.resetUrl || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const token = new URLSearchParams(window.location.search).get('resetToken');
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not reset your password.');
      window.history.replaceState({}, '', window.location.pathname);
      setPassword('');
      setMode('login');
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const returnToLogin = () => {
    setMode('login');
    setError('');
    setMessage('');
    setResetUrl('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-rose-100 via-cream-50 to-rose-200">
      
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-300/40 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />

      {/* Login Card */}
      <div className="glass-card p-8 md:p-10 rounded-3xl max-w-md w-full shadow-romantic-lg relative z-10 border border-white/80">
        
        {/* Top Floating Heart Badge */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-burgundy-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-500/30">
          <Heart className="w-8 h-8 text-white fill-white animate-heartbeat" />
        </div>

        {/* Headings */}
        <div className="text-center mb-8">
          <h1 className="font-handwriting text-4xl md:text-5xl font-bold text-burgundy-700 leading-tight">
            {CONFIG.WEBSITE_TITLE}
          </h1>
          <p className="text-sm font-medium text-rose-600 mt-1">
            {CONFIG.SUBTITLE}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-100/90 border border-rose-300 text-rose-800 text-xs font-medium text-center">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium text-center">
            {message}
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' && <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-rose-800 uppercase tracking-wider mb-1">
              Username or Email
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-rose-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/80 border border-rose-200 text-rose-900 placeholder-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-rose-800 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 text-rose-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/80 border border-rose-200 text-rose-900 placeholder-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white text-sm transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-burgundy-700 text-white font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Enter Our World</span>
                <Heart className="w-4 h-4 fill-white" />
              </>
            )}
          </button>
          <button type="button" onClick={() => { setMode('forgot'); setError(''); setMessage(''); }} className="w-full text-xs font-semibold text-rose-600 hover:text-burgundy-700 transition-colors">
            Forgot your password?
          </button>
        </form>
        }

        {mode === 'forgot' && <form onSubmit={requestReset} className="space-y-4">
          <p className="text-sm text-center text-rose-600">Enter the username or email linked to your account.</p>
          <div className="relative">
            <Mail className="w-5 h-5 text-rose-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Username or email" required className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/80 border border-rose-200 text-rose-900 placeholder-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white text-sm transition-all" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-burgundy-700 text-white font-semibold text-sm shadow-md transition-all">
            {loading ? 'Creating link...' : 'Create Reset Link'}
          </button>
          {resetUrl && <a href={resetUrl} className="block text-center text-xs font-semibold text-rose-600 hover:text-burgundy-700 underline">Open your reset link</a>}
          <button type="button" onClick={returnToLogin} className="w-full inline-flex items-center justify-center gap-1 text-xs font-semibold text-rose-600 hover:text-burgundy-700"><ArrowLeft className="w-3.5 h-3.5" /> Back to login</button>
        </form>}

        {mode === 'reset' && <form onSubmit={resetPassword} className="space-y-4">
          <p className="text-sm text-center text-rose-600">Choose a new password for your account.</p>
          <div className="relative">
            <KeyRound className="w-5 h-5 text-rose-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password (minimum 6 characters)" minLength="6" required className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/80 border border-rose-200 text-rose-900 placeholder-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white text-sm transition-all" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-burgundy-700 text-white font-semibold text-sm shadow-md transition-all">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>}

        {/* Footer Note */}
        <div className="mt-8 pt-4 border-t border-rose-100 text-center">
          <p className="text-xs text-rose-500 font-medium italic flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            {CONFIG.LOGIN_MESSAGE}
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
