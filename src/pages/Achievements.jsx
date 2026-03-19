import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { ACHIEVEMENTS } from '../utils/achievements';
import { Trophy, Lock } from 'lucide-react';

export default function Achievements() {
  const { user, levelData } = useApp();
  const unlocked = user.unlockedAchievements || [];
  const unlockedCount = unlocked.length;

  const stats = {
    level: levelData.level,
    streak: user.streak,
    habitsCompleted: user.habitsCompleted,
    goalsCompleted: user.goalsCompleted,
    journalEntries: user.journalEntries,
    moodLogs: user.moodLogs,
    healthLogs: user.healthLogs,
    savingsMonths: user.savingsMonths,
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>Achievements</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{unlockedCount} / {ACHIEVEMENTS.length} unlocked · {user.totalXP} total XP</p>
      </motion.div>

      {/* Progress */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card p-5 mb-6">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>🏆</div>
          <div>
            <div className="font-display font-bold text-2xl" style={{ color: '#fbbf24' }}>{unlockedCount}/{ACHIEVEMENTS.length}</div>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Achievements Unlocked</div>
          </div>
        </div>
        <div className="xp-bar">
          <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }} />
        </div>
      </motion.div>

      {/* Unlocked */}
      {unlockedCount > 0 && (
        <div className="mb-6">
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Trophy size={16} className="text-amber-400" /> Unlocked
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ACHIEVEMENTS.filter(a => unlocked.includes(a.id)).map((ach, i) => (
              <motion.div key={ach.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                className="glass-card p-4 flex items-center gap-3"
                style={{ border: '1px solid rgba(245,158,11,0.25)', background: 'rgba(245,158,11,0.05)' }}>
                <div className="text-3xl">{ach.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm" style={{ color: '#fbbf24' }}>{ach.title}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{ach.description}</div>
                  <div className="text-xs mt-1 font-mono" style={{ color: '#fbbf24' }}>+{ach.xp} XP</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      <div>
        <h3 className="font-display font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Lock size={16} style={{ color: 'var(--text-muted)' }} /> Locked
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ACHIEVEMENTS.filter(a => !unlocked.includes(a.id)).map((ach, i) => {
            const close = ach.check(stats);
            return (
              <motion.div key={ach.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="glass-card p-4 flex items-center gap-3 opacity-50">
                <div className="text-3xl grayscale">{ach.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm" style={{ color: 'var(--text-muted)' }}>{ach.title}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{ach.description}</div>
                  <div className="text-xs mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>+{ach.xp} XP</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
