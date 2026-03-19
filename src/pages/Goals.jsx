import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, X, Target, CheckCircle, ChevronRight, Edit3 } from 'lucide-react';

const CATEGORIES = ['health', 'finance', 'learning', 'productivity', 'mind', 'spiritual'];

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', category: 'health', progress: 0, target: 100, unit: '%', deadline: '', xp: 100 });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addGoal({ ...form, progress: 0 });
    setForm({ title: '', category: 'health', progress: 0, target: 100, unit: '%', deadline: '', xp: 100 });
    setShowAdd(false);
  };

  const handleUpdateProgress = (id, value) => {
    updateGoal(id, { progress: Math.min(parseFloat(value) || 0, goals.find(g => g.id === id).target) });
  };

  const toggleMilestone = (goalId, mi) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    const milestones = goal.milestones.map((m, i) => i === mi ? { ...m, done: !m.done } : m);
    updateGoal(goalId, { milestones });
  };

  const active = goals.filter(g => !g.completed);
  const completed = goals.filter(g => g.completed);

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>Goals</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{active.length} active · {completed.length} completed</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Goal
        </button>
      </motion.div>

      {/* Active Goals */}
      <div className="grid gap-4 mb-8">
        {active.map((g, i) => {
          const pct = Math.min(Math.round((g.progress / g.target) * 100), 100);
          const catColors = { health: 'emerald', finance: 'amber', learning: 'cyan', productivity: 'blue', mind: 'purple', spiritual: 'rose' };
          const col = catColors[g.category] || 'purple';
          const colorMap = { emerald: '#34d399', amber: '#fbbf24', cyan: '#22d3ee', blue: '#60a5fa', purple: '#a78bfa', rose: '#fb7185' };
          const c = colorMap[col];
          return (
            <motion.div key={g.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }} className="glass-card p-5 group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`tag category-${g.category}`}>{g.category}</span>
                    {g.deadline && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Due: {g.deadline}</span>}
                  </div>
                  <h3 className="font-display font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>{g.title}</h3>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => deleteGoal(g.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-rose-500/10">
                    <Trash2 size={14} className="text-rose-400" />
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {g.unit === '₹' ? `₹${g.progress.toLocaleString()} / ₹${g.target.toLocaleString()}` : `${g.progress} / ${g.target} ${g.unit}`}
                  </span>
                  <span className="font-mono font-bold text-sm" style={{ color: c }}>{pct}%</span>
                </div>
                <div className="xp-bar" style={{ height: '8px' }}>
                  <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.3, duration: 0.8 }} style={{ background: `linear-gradient(90deg, ${c}aa, ${c})` }} />
                </div>
              </div>

              {/* Progress Input */}
              <div className="flex gap-3 mb-4">
                <input type="number" placeholder="Update progress"
                  onBlur={(e) => { if (e.target.value) { handleUpdateProgress(g.id, e.target.value); e.target.value = ''; } }}
                  className="input-field text-sm" style={{ flex: 1 }} />
                <div className="flex items-center justify-center px-3 rounded-xl text-sm font-medium"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-muted)', minWidth: 40 }}>
                  {g.unit}
                </div>
              </div>

              {/* Milestones */}
              {g.milestones?.length > 0 && (
                <div>
                  <div className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Milestones</div>
                  <div className="flex flex-col gap-1.5">
                    {g.milestones.map((m, mi) => (
                      <button key={mi} onClick={() => toggleMilestone(g.id, mi)}
                        className="flex items-center gap-2.5 text-left transition-all">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${m.done ? 'border-emerald-400 bg-emerald-400' : 'border-white/20'}`}>
                          {m.done && <span className="text-[10px] text-white font-bold">✓</span>}
                        </div>
                        <span className="text-sm" style={{ color: m.done ? '#34d399' : 'var(--text-muted)', textDecoration: m.done ? 'line-through' : 'none' }}>
                          {m.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <CheckCircle size={16} className="text-emerald-400" /> Completed Goals
          </h3>
          <div className="grid gap-3">
            {completed.map(g => (
              <div key={g.id} className="glass-card p-4 flex items-center gap-4 opacity-60">
                <CheckCircle size={20} className="text-emerald-400 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{g.title}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Goal completed! +{g.xp} XP earned</div>
                </div>
                <button onClick={() => deleteGoal(g.id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-rose-500/10">
                  <X size={12} className="text-rose-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {goals.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <div className="text-5xl mb-4">🎯</div>
          <h3 className="font-display font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>No goals yet</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Set your first goal and start tracking your progress</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary">Create Your First Goal</button>
        </motion.div>
      )}

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 w-full max-w-md rounded-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>New Goal</h3>
                <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <X size={16} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>GOAL TITLE</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Run a Marathon" className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>CATEGORY</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="select-field">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>TARGET</label>
                    <input type="number" value={form.target} onChange={e => setForm(f => ({ ...f, target: +e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>UNIT</label>
                    <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="%, ₹, km..." className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>DEADLINE (optional)</label>
                  <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>XP REWARD: {form.xp}</label>
                  <input type="range" min="50" max="500" step="50" value={form.xp} onChange={e => setForm(f => ({ ...f, xp: +e.target.value }))} className="w-full accent-purple-500" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleAdd} className="btn-primary flex-1">Create Goal</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
