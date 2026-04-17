import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Play, Pause, RotateCcw, SkipForward, Settings, X } from 'lucide-react';
import confetti from 'canvas-confetti';

const MODES = [
  { id: 'focus', label: 'Focus', minutes: 25, color: '#8b5cf6', xp: 15 },
  { id: 'short', label: 'Short Break', minutes: 5, color: '#06b6d4', xp: 3 },
  { id: 'long', label: 'Long Break', minutes: 15, color: '#10b981', xp: 5 },
];

const SOUNDS = [
  { id: 'none', label: 'Silent', emoji: '🔇' },
  { id: 'rain', label: 'Rain', emoji: '🌧️' },
  { id: 'forest', label: 'Forest', emoji: '🌿' },
  { id: 'ocean', label: 'Ocean', emoji: '🌊' },
  { id: 'fire', label: 'Fire', emoji: '🔥' },
  { id: 'cafe', label: 'Café', emoji: '☕' },
];

function useTimer(totalSeconds, onComplete) {
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    setTimeLeft(totalSeconds);
    setRunning(false);
  }, [totalSeconds]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            onComplete?.();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    setTimeLeft(totalSeconds);
    setRunning(false);
  }, [totalSeconds]);

  return { timeLeft, running, setRunning, reset };
}

function RingTimer({ timeLeft, total, color, size = 240 }) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const progress = timeLeft / total;
  const offset = circ * (1 - progress);
  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 12px ${color}80)` }}
          transition={{ duration: 0.5 }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-mono font-bold" style={{ fontSize: size * 0.22, color: 'var(--text-primary)', letterSpacing: '-2px', lineHeight: 1 }}>
          {mins}:{secs}
        </div>
        <div className="text-sm mt-1 text-muted">remaining</div>
      </div>
    </div>
  );
}

export default function Pomodoro() {
  const { addXP, user } = useApp();
  const [modeIdx, setModeIdx] = useState(0);
  const [sessions, setSessions] = useState(0);
  const [sound, setSound] = useState('none');
  const [showSettings, setShowSettings] = useState(false);
  const [customMins, setCustomMins] = useState({ focus: 25, short: 5, long: 15 });
  const [completedToday, setCompletedToday] = useState(0);

  const mode = MODES[modeIdx];
  const totalSeconds = customMins[mode.id] * 60;

  const handleComplete = useCallback(() => {
    if (mode.id === 'focus') {
      setSessions(s => s + 1);
      setCompletedToday(c => c + 1);
      addXP(mode.xp, `+${mode.xp} XP — Focus session complete! 🎯`);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 }, colors: ['#8b5cf6', '#06b6d4', '#10b981'] });
      // Auto-suggest break
      if ((sessions + 1) % 4 === 0) {
        setTimeout(() => setModeIdx(2), 500); // long break after 4
      } else {
        setTimeout(() => setModeIdx(1), 500); // short break
      }
    } else {
      addXP(mode.xp, `+${mode.xp} XP — Break time done!`);
      setTimeout(() => setModeIdx(0), 500);
    }
  }, [mode, sessions, addXP]);

  const { timeLeft, running, setRunning, reset } = useTimer(totalSeconds, handleComplete);

  const switchMode = (idx) => {
    setModeIdx(idx);
    reset();
  };

  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto pb-24 lg:pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>Focus Timer</h1>
          <p className="text-sm text-muted">Deep work sessions. Earn XP by staying focused.</p>
        </div>
        <button onClick={() => setShowSettings(true)} className="btn-secondary p-2.5">
          <Settings size={16} />
        </button>
      </motion.div>

      {/* Mode Tabs */}
      <div className="flex gap-2 mb-8 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
        {MODES.map((m, i) => (
          <button key={m.id} onClick={() => switchMode(i)}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: modeIdx === i ? m.color + '20' : 'transparent',
              color: modeIdx === i ? m.color : 'var(--text-muted)',
              border: modeIdx === i ? `1px solid ${m.color}40` : '1px solid transparent',
            }}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Timer Ring */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center mb-8">
        <RingTimer timeLeft={timeLeft} total={totalSeconds} color={mode.color} size={220} />

        {/* Session dots */}
        <div className="flex gap-2 mt-5">
          {[0,1,2,3].map(i => (
            <div key={i} className="w-3 h-3 rounded-full transition-all"
              style={{ background: i < (sessions % 4) ? mode.color : 'rgba(255,255,255,0.12)', boxShadow: i < (sessions % 4) ? `0 0 6px ${mode.color}` : 'none' }} />
          ))}
        </div>
        <div className="text-xs text-muted mt-2">{sessions} sessions · {completedToday * customMins.focus} min focused today</div>
      </motion.div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={reset}
          className="w-12 h-12 rounded-2xl flex items-center justify-center btn-secondary">
          <RotateCcw size={18} />
        </motion.button>

        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setRunning(r => !r)}
          className="w-20 h-20 rounded-3xl flex items-center justify-center font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${mode.color}, ${mode.color}cc)`, boxShadow: `0 8px 32px ${mode.color}50` }}>
          {running ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: 3 }} />}
        </motion.button>

        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => { switchMode((modeIdx + 1) % 3); }}
          className="w-12 h-12 rounded-2xl flex items-center justify-center btn-secondary">
          <SkipForward size={18} />
        </motion.button>
      </div>

      {/* Sound Picker */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="glass-card p-5 mb-5">
        <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">🎵 Focus Sound</div>
        <div className="grid grid-cols-3 gap-2">
          {SOUNDS.map(s => (
            <button key={s.id} onClick={() => setSound(s.id)}
              className="flex items-center gap-2 p-3 rounded-xl text-sm transition-all"
              style={{
                background: sound === s.id ? `${mode.color}15` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${sound === s.id ? mode.color + '40' : 'rgba(255,255,255,0.06)'}`,
                color: sound === s.id ? mode.color : 'var(--text-muted)',
              }}>
              <span>{s.emoji}</span>
              <span className="text-xs font-medium">{s.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="glass-card p-5">
        <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Today's Stats</div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Sessions', value: completedToday, emoji: '🎯' },
            { label: 'Focus Time', value: `${completedToday * customMins.focus}m`, emoji: '⏱️' },
            { label: 'XP Earned', value: `+${completedToday * mode.xp}`, emoji: '⭐' },
          ].map(s => (
            <div key={s.label} className="text-center p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-xl mb-1">{s.emoji}</div>
              <div className="font-display font-bold text-lg" style={{ color: mode.color }}>{s.value}</div>
              <div className="text-xs text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={e => e.target === e.currentTarget && setShowSettings(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="glass-card p-6 w-full max-w-sm rounded-3xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Timer Settings</h3>
                <button onClick={() => setShowSettings(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10">
                  <X size={16} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {[
                  { key: 'focus', label: 'Focus Duration', emoji: '🎯' },
                  { key: 'short', label: 'Short Break', emoji: '☕' },
                  { key: 'long', label: 'Long Break', emoji: '🛋️' },
                ].map(item => (
                  <div key={item.key}>
                    <label className="text-xs font-medium text-muted mb-1 block">{item.emoji} {item.label}: {customMins[item.key]} min</label>
                    <input type="range" min="1" max="60" value={customMins[item.key]}
                      onChange={e => { setCustomMins(m => ({ ...m, [item.key]: +e.target.value })); reset(); }}
                      className="w-full accent-purple-500" />
                  </div>
                ))}
              </div>
              <button onClick={() => setShowSettings(false)} className="btn-primary w-full mt-5 justify-center">Done</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}