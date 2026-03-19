import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Zap, Star } from 'lucide-react';

export default function ToastSystem() {
  const { toast, newAchievement } = useApp();

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toast && (
          <motion.div key="toast"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl border"
            style={{
              background: toast.type === 'levelup'
                ? 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(6,182,212,0.2))'
                : 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(139,92,246,0.15))',
              borderColor: toast.type === 'levelup' ? 'rgba(139,92,246,0.5)' : 'rgba(6,182,212,0.3)',
              backdropFilter: 'blur(20px)',
              boxShadow: toast.type === 'levelup' ? '0 8px 32px rgba(139,92,246,0.4)' : '0 8px 32px rgba(0,0,0,0.4)',
              maxWidth: 320,
            }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: toast.type === 'levelup' ? 'rgba(139,92,246,0.3)' : 'rgba(6,182,212,0.2)' }}>
              {toast.type === 'levelup' ? <Star size={16} className="text-purple-300" /> : <Zap size={16} className="text-cyan-400" />}
            </div>
            <div>
              {toast.type === 'levelup' ? (
                <>
                  <div className="text-sm font-bold text-purple-300">🎉 LEVEL UP!</div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{toast.message}</div>
                </>
              ) : (
                <>
                  <div className="text-sm font-semibold text-cyan-400">+{toast.xp} XP</div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{toast.message}</div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {newAchievement && (
          <motion.div key="achievement"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl border"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(251,191,36,0.1))',
              borderColor: 'rgba(245,158,11,0.45)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 30px rgba(245,158,11,0.2)',
              maxWidth: 320,
            }}>
            <div className="text-2xl flex-shrink-0">{newAchievement.icon}</div>
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Achievement Unlocked!</div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{newAchievement.title}</div>
              <div className="text-xs text-muted">{newAchievement.description} · +{newAchievement.xp} XP</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}