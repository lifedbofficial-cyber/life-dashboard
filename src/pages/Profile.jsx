import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { getLevelProgress, getLevelTitle, LEVEL_THRESHOLDS } from '../utils/xpSystem';
import { ACHIEVEMENTS } from '../utils/achievements';
import { Download, Trash2, Edit3, Check, X, Shield, Zap, Flame, Trophy } from 'lucide-react';

const AVATARS = ['🧙', '🦸', '🧑‍🚀', '🧑‍💻', '🧝', '🥷', '🧑‍🎨', '🦊', '🐉', '⚡', '🌟', '🔥', '💎', '🚀', '🎯'];

export default function Profile() {
  const { user, updateUser, levelData, habits, goals, journal, exportData, resetAllData } = useApp();
  const [editingName, setEditingName] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [nameInput, setNameInput] = useState(user.name);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const saveName = () => {
    if (nameInput.trim()) updateUser({ name: nameInput.trim() });
    setEditingName(false);
  };

  const selectAvatar = (a) => {
    updateUser({ avatar: a });
    setEditingAvatar(false);
  };

  const handleReset = () => {
    resetAllData();
    setShowResetConfirm(false);
  };

  const unlockedCount = user.unlockedAchievements?.length || 0;
  const totalHabits = habits.length;
  const completedGoals = goals.filter(g => g.completed).length;

  const nextLevelXP = LEVEL_THRESHOLDS[levelData.level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const currentLevelXP = LEVEL_THRESHOLDS[levelData.level - 1] || 0;

  const stats = [
    { icon: '🔥', label: 'Day Streak', value: user.streak },
    { icon: '⭐', label: 'Total XP', value: user.totalXP.toLocaleString() },
    { icon: '💪', label: 'Habits Done', value: user.habitsCompleted },
    { icon: '🎯', label: 'Goals Done', value: user.goalsCompleted },
    { icon: '📖', label: 'Journal Entries', value: user.journalEntries },
    { icon: '😊', label: 'Mood Logs', value: user.moodLogs },
    { icon: '🏆', label: 'Achievements', value: `${unlockedCount}/${ACHIEVEMENTS.length}` },
    { icon: '❤️', label: 'Health Logs', value: user.healthLogs },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>Profile</h1>
        <p className="text-sm text-muted">Manage your identity and data.</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card p-6 mb-5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(circle at top left, rgba(139,92,246,0.08), transparent 60%)',
        }} />
        <div className="relative z-10 flex items-center gap-5 flex-wrap">
          {/* Avatar */}
          <div className="relative">
            <motion.div whileHover={{ scale: 1.05 }}
              onClick={() => setEditingAvatar(true)}
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl cursor-pointer transition-all"
              style={{ background: 'rgba(139,92,246,0.15)', border: '2px solid rgba(139,92,246,0.3)' }}>
              {user.avatar}
            </motion.div>
            <button onClick={() => setEditingAvatar(true)}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: '#7c3aed', border: '2px solid var(--bg-primary)' }}>
              <Edit3 size={10} className="text-white" />
            </button>
          </div>

          {/* Name & Level */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input value={nameInput} onChange={e => setNameInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                    autoFocus className="input-field py-1.5 text-lg font-semibold" style={{ maxWidth: 200 }} />
                  <button onClick={saveName} className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-500/20 hover:bg-emerald-500/30">
                    <Check size={14} className="text-emerald-400" />
                  </button>
                  <button onClick={() => setEditingName(false)} className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20">
                    <X size={14} className="text-red-400" />
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-display font-bold text-2xl" style={{ color: 'var(--text-primary)' }}>{user.name}</h2>
                  <button onClick={() => { setNameInput(user.name); setEditingName(true); }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all">
                    <Edit3 size={13} style={{ color: 'var(--text-muted)' }} />
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-sm font-bold" style={{ color: '#a78bfa' }}>Level {levelData.level}</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' }}>{levelData.title}</span>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                <span>{levelData.xpInLevel} XP</span>
                <span>{levelData.xpForLevel} XP to next level</span>
              </div>
              <div className="xp-bar">
                <motion.div className="xp-bar-fill" initial={{ width: 0 }} animate={{ width: `${levelData.progress}%` }}
                  transition={{ duration: 1, delay: 0.3 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Avatar Picker */}
        <AnimatePresence>
          {editingAvatar && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className="mt-5 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted uppercase tracking-wider">Pick Avatar</span>
                <button onClick={() => setEditingAvatar(false)}>
                  <X size={16} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {AVATARS.map(a => (
                  <motion.button key={a} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                    onClick={() => selectAvatar(a)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all"
                    style={{
                      background: user.avatar === a ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.05)',
                      border: `2px solid ${user.avatar === a ? '#8b5cf6' : 'transparent'}`,
                    }}>
                    {a}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Stats Grid */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="glass-card p-5 mb-5">
        <h3 className="font-display font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Lifetime Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <div key={s.label} className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
              <div className="text-xs text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="glass-card p-5">
        <h3 className="font-display font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Data Management</h3>
        <div className="flex flex-col gap-3">

          {/* Export */}
          <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(6,182,212,0.15)' }}>
                <Download size={16} className="text-cyan-400" />
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Export Backup</div>
                <div className="text-xs text-muted">Download all your data as JSON</div>
              </div>
            </div>
            <button onClick={exportData} className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
              <Download size={14} /> Export
            </button>
          </div>

          {/* Reset */}
          <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(244,63,94,0.15)' }}>
                <Trash2 size={16} className="text-rose-400" />
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Reset All Data</div>
                <div className="text-xs text-muted">Permanently wipe everything and start fresh</div>
              </div>
            </div>
            <button onClick={() => setShowResetConfirm(true)}
              className="text-sm px-4 py-2 rounded-xl font-medium transition-all"
              style={{ background: 'rgba(244,63,94,0.15)', color: '#fb7185', border: '1px solid rgba(244,63,94,0.3)' }}>
              Reset
            </button>
          </div>
        </div>
      </motion.div>

      {/* Reset Confirm Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="glass-card p-6 max-w-sm w-full rounded-3xl text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="font-display font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>Reset Everything?</h3>
              <p className="text-sm mb-6 text-muted">This will delete all your habits, goals, journal entries, XP, and stats. This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowResetConfirm(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleReset}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all"
                  style={{ background: 'rgba(244,63,94,0.2)', color: '#fb7185', border: '1px solid rgba(244,63,94,0.4)' }}>
                  Yes, Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}