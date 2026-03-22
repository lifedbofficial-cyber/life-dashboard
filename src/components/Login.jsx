import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await login();
    } catch (err) {
      setError('Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'var(--bg-primary)' }}>

      {/* Ambient glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md w-full relative z-10 px-4">

        <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="text-8xl mb-6">🌟</motion.div>

        <h1 className="font-display font-bold text-4xl mb-3" style={{ color: 'var(--text-primary)' }}>
          Welcome to{' '}
          <span className="text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(135deg, #a78bfa, #22d3ee)' }}>
            Life OS
          </span>
        </h1>

        <p className="text-base mb-2" style={{ color: 'var(--text-muted)' }}>
          Your gamified life operating system.
        </p>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          Sign in with Google to sync your data across all devices — forever.
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {['🔥 Habits', '🎯 Goals', '⭐ XP & Levels', '☁️ Cloud Sync'].map(f => (
            <span key={f} className="text-xs font-medium px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', color: '#a78bfa' }}>
              {f}
            </span>
          ))}
        </div>

        {/* Google Sign In Button */}
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={handleLogin}
          disabled={loading}
          className="w-full max-w-xs mx-auto flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl font-semibold text-sm transition-all"
          style={{
            background: '#fff',
            color: '#1f1f1f',
            border: '1px solid #e0e0e0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            opacity: loading ? 0.7 : 1,
          }}>
          {loading ? (
            <Loader2 size={18} className="animate-spin text-gray-500" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {loading ? 'Signing in...' : 'Continue with Google'}
        </motion.button>

        {error && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs p-3 rounded-xl mt-4 max-w-xs mx-auto"
            style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', color: '#fb7185' }}>
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <p className="text-xs mt-8 text-muted">
          Your data is saved to the cloud and syncs across all your devices.
        </p>
      </motion.div>
    </div>
  );
}