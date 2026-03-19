import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { ChevronRight, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { loadGoogleScript, signInWithGoogle, GOOGLE_CLIENT_ID } from '../utils/googleAuth';

const AVATARS = ['🧙','🦸','🧑‍🚀','🧑‍💻','🧝','🥷','🧑‍🎨','🦊','🐉','⚡','🌟','🔥','💎','🚀','🎯'];

const GOOGLE_CONFIGURED = GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE';

export default function Onboarding() {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState(0); // 0=welcome, 1=name, 2=avatar, 3=ready
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🧙');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const [googleProfile, setGoogleProfile] = useState(null); // { name, email, picture }

  useEffect(() => {
    if (GOOGLE_CONFIGURED) loadGoogleScript().catch(() => {});
  }, []);

  const handleGoogleLogin = async () => {
    if (!GOOGLE_CONFIGURED) {
      setGoogleError('Google Client ID not configured. See src/utils/googleAuth.js for setup instructions.');
      return;
    }
    setGoogleLoading(true);
    setGoogleError('');
    try {
      await loadGoogleScript();
      const profile = await signInWithGoogle();
      setGoogleProfile(profile);
      setName(profile.name);
      // Skip to avatar step so they can optionally change
      setStep(2);
    } catch (err) {
      if (err.message !== 'dismissed') {
        setGoogleError('Google sign-in failed. Try manual setup instead.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const next = () => {
    if (step === 3) {
      completeOnboarding(
        name.trim() || 'Adventurer',
        avatar,
        googleProfile || null
      );
    } else {
      setStep(s => s + 1);
    }
  };

  const canProceed = step === 1 ? name.trim().length > 0 : true;

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

      <AnimatePresence mode="wait">

        {/* ── Step 0: Welcome ─────────────────────────────── */}
        {step === 0 && (
          <motion.div key="welcome"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
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
              Track habits, goals, mood, health, finances and journaling — all in one place.
            </p>

            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {['🔥 Habits', '🎯 Goals', '⭐ XP & Levels', '🤖 AI Coach'].map(f => (
                <span key={f} className="text-xs font-medium px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', color: '#a78bfa' }}>
                  {f}
                </span>
              ))}
            </div>

            {/* ── Google Sign-In ── */}
            <div className="flex flex-col gap-3 items-center">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full max-w-xs flex items-center justify-center gap-3 py-3 px-6 rounded-xl font-semibold text-sm transition-all"
                style={{
                  background: '#fff',
                  color: '#1f1f1f',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  opacity: googleLoading ? 0.7 : 1,
                }}>
                {googleLoading ? (
                  <Loader2 size={18} className="animate-spin text-gray-500" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                {googleLoading ? 'Signing in...' : 'Continue with Google'}
              </motion.button>

              {/* Error message */}
              <AnimatePresence>
                {googleError && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-start gap-2 text-xs p-3 rounded-xl max-w-xs text-left"
                    style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', color: '#fb7185' }}>
                    <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                    <span>{googleError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Divider */}
              <div className="flex items-center gap-3 w-full max-w-xs">
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <span className="text-xs text-muted">or</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>

              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={next}
                className="w-full max-w-xs btn-primary py-3 flex items-center justify-center gap-2">
                Set up manually <ChevronRight size={16} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Step 1: Name ──────────────────────────────── */}
        {step === 1 && (
          <motion.div key="name"
            initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }}
            className="text-center max-w-sm w-full relative z-10 px-4">
            <div className="text-6xl mb-6">👤</div>
            <h2 className="font-display font-bold text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>
              What's your name?
            </h2>
            <p className="text-sm mb-8 text-muted">This is how you'll appear in your dashboard.</p>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canProceed && next()}
              placeholder="Enter your name..."
              autoFocus
              className="input-field text-center text-lg mb-6"
            />
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={next} disabled={!canProceed}
              className="btn-primary px-8 py-3 flex items-center gap-2 mx-auto"
              style={{ opacity: canProceed ? 1 : 0.4 }}>
              Continue <ChevronRight size={18} />
            </motion.button>
          </motion.div>
        )}

        {/* ── Step 2: Avatar ────────────────────────────── */}
        {step === 2 && (
          <motion.div key="avatar"
            initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }}
            className="text-center max-w-sm w-full relative z-10 px-4">

            {/* Show Google profile pic OR emoji */}
            {googleProfile?.picture ? (
              <div className="flex flex-col items-center mb-4">
                <img src={googleProfile.picture} alt={name} className="w-20 h-20 rounded-2xl mb-2 object-cover" />
                <p className="text-xs text-muted">Signed in as {googleProfile.email}</p>
              </div>
            ) : (
              <motion.div className="text-6xl mb-4"
                key={avatar} animate={{ scale: [0.8, 1.1, 1] }} transition={{ duration: 0.25 }}>
                {avatar}
              </motion.div>
            )}

            <h2 className="font-display font-bold text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>
              Choose your avatar
            </h2>
            <p className="text-sm mb-6 text-muted">
              {googleProfile ? 'Your Google photo is saved. Pick an emoji avatar too!' : 'Pick an emoji that represents you.'}
            </p>
            <div className="grid grid-cols-5 gap-3 mb-8">
              {AVATARS.map(a => (
                <motion.button key={a} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                  onClick={() => setAvatar(a)}
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mx-auto transition-all"
                  style={{
                    background: avatar === a ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${avatar === a ? '#8b5cf6' : 'transparent'}`,
                    boxShadow: avatar === a ? '0 0 20px rgba(139,92,246,0.4)' : 'none',
                  }}>
                  {a}
                </motion.button>
              ))}
            </div>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={next} className="btn-primary px-8 py-3 flex items-center gap-2 mx-auto">
              Continue <ChevronRight size={18} />
            </motion.button>
          </motion.div>
        )}

        {/* ── Step 3: Ready ─────────────────────────────── */}
        {step === 3 && (
          <motion.div key="ready"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="text-center max-w-md relative z-10 px-4">

            {googleProfile?.picture ? (
              <img src={googleProfile.picture} alt={name}
                className="w-20 h-20 rounded-2xl mx-auto mb-4 object-cover border-2 border-purple-500/40" />
            ) : (
              <motion.div className="text-7xl mb-6"
                animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6 }}>
                {avatar}
              </motion.div>
            )}

            <h2 className="font-display font-bold text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>
              You're all set,{' '}
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(135deg, #a78bfa, #22d3ee)' }}>
                {name || 'Adventurer'}
              </span>!
            </h2>
            {googleProfile && (
              <p className="text-xs text-muted mb-1">Signed in with Google · {googleProfile.email}</p>
            )}
            <p className="text-sm mb-3 text-muted">Your journey to a better life starts now.</p>
            <p className="text-xs mb-10 text-muted">
              Complete habits → earn XP → level up → unlock achievements
            </p>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={next}
              className="btn-primary px-10 py-3 text-base flex items-center gap-2 mx-auto"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', boxShadow: '0 8px 32px rgba(124,58,237,0.4)' }}>
              <Sparkles size={18} /> Enter Life OS
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step dots (steps 1 & 2 only) */}
      {step > 0 && step < 3 && (
        <div className="absolute bottom-8 flex gap-2">
          {[1, 2].map(i => (
            <div key={i} className="h-2 rounded-full transition-all"
              style={{
                background: step >= i ? '#8b5cf6' : 'rgba(255,255,255,0.15)',
                width: step === i ? 20 : 8,
              }} />
          ))}
        </div>
      )}
    </div>
  );
}