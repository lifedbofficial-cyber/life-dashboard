import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, CheckCircle2, Circle, Flame, Zap, X, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import HeatmapCalendar from '../components/HeatmapCalendar';
import confetti from 'canvas-confetti';

const CATEGORIES = ['health', 'mind', 'learning', 'finance', 'spiritual', 'productivity'];
const ICONS = ['💪', '🧘', '📚', '💧', '🏃', '🥗', '😴', '💰', '🎯', '✍️', '🎵', '🌿', '🧠', '💊', '🚴'];

export default function Habits() {
  const { habits, completeHabit, addHabit, deleteHabit, reorderHabits } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [expandedHabit, setExpandedHabit] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'health', xp: 10, icon: '💪' });
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const today = new Date().toDateString();

  const fire = () => {
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'] });
  };

  const handleComplete = (id) => {
    const h = habits.find(x => x.id === id);
    if (h && !h.completedDates?.includes(today)) {
      completeHabit(id);
      fire();
    }
  };

  const handleAdd = () => {
    if (!form.name.trim()) return;
    addHabit(form);
    setForm({ name: '', category: 'health', xp: 10, icon: '💪' });
    setShowAdd(false);
  };

  // Drag to reorder
  const handleDragStart = (i) => setDragIdx(i);
  const handleDragOver = (e, i) => { e.preventDefault(); setDragOverIdx(i); };
  const handleDrop = (i) => {
    if (dragIdx === null || dragIdx === i) { setDragIdx(null); setDragOverIdx(null); return; }
    const next = [...habits];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(i, 0, moved);
    reorderHabits(next);
    setDragIdx(null);
    setDragOverIdx(null);
  };

  const completedCount = habits.filter(h => h.completedDates?.includes(today)).length;
  const completionRate = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  // Group by category preserving order
  const grouped = {};
  habits.forEach(h => {
    if (!grouped[h.category]) grouped[h.category] = [];
    grouped[h.category].push(h);
  });

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>Habit Tracker</h1>
        <p className="text-sm text-muted">Build atomic habits. Earn XP. Level up your life.</p>
      </motion.div>

      {/* Progress Overview */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>🔥</div>
            <div>
              <div className="font-display font-bold text-2xl" style={{ color: '#fbbf24' }}>{completionRate}%</div>
              <div className="text-xs text-muted">{completedCount} of {habits.length} habits done today</div>
            </div>
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Habit
          </button>
        </div>
        <div className="xp-bar">
          <motion.div className="xp-bar-fill" initial={{ width: 0 }} animate={{ width: `${completionRate}%` }}
            transition={{ duration: 1, ease: 'easeOut' }} />
        </div>
        <p className="text-xs text-muted mt-2">💡 Drag the grip icon to reorder your habits</p>
      </motion.div>

      {/* Habit List — flat, draggable */}
      <div className="flex flex-col gap-2.5 mb-4">
        {habits.map((h, i) => {
          const done = h.completedDates?.includes(today);
          const isExpanded = expandedHabit === h.id;
          return (
            <motion.div key={h.id}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={() => handleDrop(i)}
              onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
              className="rounded-2xl transition-all group"
              style={{
                background: done ? 'rgba(16,185,129,0.08)' : 'var(--bg-card)',
                border: `1px solid ${dragOverIdx === i ? 'rgba(139,92,246,0.5)' : done ? 'rgba(16,185,129,0.25)' : 'var(--border)'}`,
                opacity: dragIdx === i ? 0.5 : 1,
                boxShadow: dragOverIdx === i ? '0 0 0 2px rgba(139,92,246,0.3)' : 'none',
              }}>
              <div className="flex items-center gap-3 p-4">
                {/* Drag Handle */}
                <div className="cursor-grab active:cursor-grabbing opacity-30 hover:opacity-70 transition-opacity flex-shrink-0">
                  <GripVertical size={16} style={{ color: 'var(--text-muted)' }} />
                </div>

                <div className="text-2xl flex-shrink-0">{h.icon}</div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium" style={{ color: done ? '#34d399' : 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none' }}>
                    {h.name}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <Zap size={10} className="text-cyan-400" /> +{h.xp} XP
                    </span>
                    <span className={`tag category-${h.category} text-[10px] py-0 px-2`}>{h.category}</span>
                    {h.completedDates?.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-muted">
                        <Flame size={10} className="text-amber-400" /> {h.completedDates.length} done
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* Expand heatmap */}
                  {h.completedDates?.length > 0 && (
                    <button onClick={() => setExpandedHabit(isExpanded ? null : h.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5 transition-all">
                      {isExpanded ? <ChevronUp size={13} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />}
                    </button>
                  )}

                  <button onClick={() => handleComplete(h.id)} className="transition-all">
                    {done
                      ? <CheckCircle2 size={26} className="text-emerald-400" />
                      : <Circle size={26} className="hover:text-purple-400 transition-colors" style={{ color: 'rgba(255,255,255,0.2)' }} />}
                  </button>

                  <button onClick={() => deleteHabit(h.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg flex items-center justify-center hover:bg-rose-500/10">
                    <Trash2 size={13} className="text-rose-400" />
                  </button>
                </div>
              </div>

              {/* Expandable Heatmap */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden">
                    <div className="px-4 pb-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <HeatmapCalendar completedDates={h.completedDates || []} habitName={h.name} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {habits.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <div className="text-5xl mb-4">🌱</div>
          <h3 className="font-display font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>No habits yet</h3>
          <p className="text-sm mb-4 text-muted">Add your first habit to start earning XP</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary">Add Your First Habit</button>
        </motion.div>
      )}

      {/* Add Habit Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 w-full max-w-md rounded-3xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>New Habit</h3>
                <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <X size={16} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>

              <div className="mb-4">
                <label className="text-xs font-medium mb-2 block text-muted">CHOOSE ICON</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map(icon => (
                    <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all"
                      style={{ background: form.icon === icon ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.05)', border: `1px solid ${form.icon === icon ? 'rgba(139,92,246,0.5)' : 'transparent'}` }}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted">HABIT NAME</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Morning Meditation" className="input-field" onKeyDown={e => e.key === 'Enter' && handleAdd()} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted">CATEGORY</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="select-field">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted">XP REWARD: {form.xp}</label>
                  <input type="range" min="5" max="30" step="5" value={form.xp}
                    onChange={e => setForm(f => ({ ...f, xp: +e.target.value }))}
                    className="w-full accent-purple-500" />
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleAdd} className="btn-primary flex-1">Add Habit</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}