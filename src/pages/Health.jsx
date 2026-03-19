import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Droplets, Footprints, Dumbbell, Moon, Plus, Minus } from 'lucide-react';

function RingProgress({ value, max, color, size = 80, strokeWidth = 8, children }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const offset = circ * (1 - pct);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="progress-ring">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={strokeWidth} />
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

export default function Health() {
  const { todayHealth, logHealth } = useApp();
  const water = todayHealth.water || 0;
  const steps = todayHealth.steps || 0;
  const sleep = todayHealth.sleep || 0;
  const workout = todayHealth.workout || false;

  const [stepsInput, setStepsInput] = useState('');
  const [sleepInput, setSleepInput] = useState('');

  const handleWater = (delta) => {
    logHealth({ water: Math.max(0, Math.min(20, (todayHealth.water || 0) + delta)) });
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>Health Tracker</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Your body is your most important asset. Track it daily.</p>
      </motion.div>

      {/* Health Score */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="glass-card p-6 mb-6 flex items-center gap-6">
        <RingProgress value={water} max={8} color="#06b6d4" size={90} strokeWidth={8}>
          <span className="text-xs font-mono font-bold" style={{ color: '#22d3ee' }}>{Math.round((water/8)*100)}%</span>
        </RingProgress>
        <div>
          <div className="font-display font-bold text-xl mb-1" style={{ color: 'var(--text-primary)' }}>Daily Health Overview</div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Stay consistent. Every healthy choice compounds over time.</div>
          <div className="flex gap-4 mt-3">
            {[
              { label: 'Water', val: `${water}/8 glasses`, ok: water >= 8, color: '#22d3ee' },
              { label: 'Steps', val: `${steps.toLocaleString()}`, ok: steps >= 10000, color: '#34d399' },
              { label: 'Sleep', val: `${sleep}h`, ok: sleep >= 7, color: '#a78bfa' },
              { label: 'Workout', val: workout ? 'Done ✓' : 'Not yet', ok: workout, color: '#fbbf24' },
            ].map(item => (
              <div key={item.label} className="text-center">
                <div className="text-xs font-bold" style={{ color: item.ok ? item.color : 'var(--text-muted)' }}>{item.val}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Trackers Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Water */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)' }}>
              <Droplets size={18} className="text-cyan-400" />
            </div>
            <div>
              <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Water Intake</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Target: 8 glasses</div>
            </div>
          </div>
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => handleWater(-1)} className="w-9 h-9 rounded-xl flex items-center justify-center btn-secondary">
              <Minus size={16} />
            </button>
            <div className="text-center">
              <div className="font-display font-bold text-3xl" style={{ color: '#22d3ee' }}>{water}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>glasses</div>
            </div>
            <button onClick={() => handleWater(1)} className="w-9 h-9 rounded-xl flex items-center justify-center btn-primary">
              <Plus size={16} />
            </button>
          </div>
          <div className="flex gap-1 flex-wrap">
            {Array.from({ length: 8 }, (_, i) => (
              <motion.div key={i} className="flex-1 h-3 rounded-full min-w-[20px] cursor-pointer"
                onClick={() => logHealth({ water: i + 1 })}
                style={{ background: i < water ? 'linear-gradient(90deg, #06b6d4, #22d3ee)' : 'rgba(255,255,255,0.07)' }}
                whileHover={{ scaleY: 1.3 }} />
            ))}
          </div>
        </motion.div>

        {/* Steps */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
              <Footprints size={18} className="text-emerald-400" />
            </div>
            <div>
              <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Step Count</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Target: 10,000 steps</div>
            </div>
          </div>
          <div className="font-display font-bold text-3xl mb-3" style={{ color: '#34d399' }}>
            {steps.toLocaleString()}
          </div>
          <div className="xp-bar mb-3" style={{ height: '8px' }}>
            <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${Math.min((steps / 10000) * 100, 100)}%` }}
              transition={{ delay: 0.3, duration: 0.8 }} style={{ background: 'linear-gradient(90deg, #10b981, #34d399)' }} />
          </div>
          <div className="flex gap-2">
            <input type="number" value={stepsInput} onChange={e => setStepsInput(e.target.value)} placeholder="Enter steps" className="input-field text-sm flex-1" />
            <button onClick={() => { if (stepsInput) { logHealth({ steps: parseInt(stepsInput) }); setStepsInput(''); } }} className="btn-primary px-4">Log</button>
          </div>
        </motion.div>

        {/* Workout */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
              <Dumbbell size={18} className="text-amber-400" />
            </div>
            <div>
              <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Workout</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>+15 XP for completing</div>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => logHealth({ workout: !workout })}
            className="w-full py-4 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: workout ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)',
              border: `2px solid ${workout ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.1)'}`,
              color: workout ? '#fbbf24' : 'var(--text-muted)',
            }}>
            {workout ? '✅ Workout Done! Great job!' : '💪 Mark Workout Complete'}
          </motion.button>
        </motion.div>

        {/* Sleep */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
              <Moon size={18} className="text-purple-400" />
            </div>
            <div>
              <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Sleep Duration</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Target: 7–9 hours</div>
            </div>
          </div>
          <div className="font-display font-bold text-3xl mb-3" style={{ color: '#a78bfa' }}>
            {sleep}<span className="text-sm ml-1" style={{ color: 'var(--text-muted)' }}>hrs</span>
          </div>
          <input type="range" min="0" max="12" step="0.5" value={sleep}
            onChange={e => logHealth({ sleep: parseFloat(e.target.value) })}
            className="w-full mb-2 accent-purple-500" />
          <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>0h</span>
            <span className={sleep >= 7 && sleep <= 9 ? 'text-emerald-400 font-medium' : ''}>
              {sleep >= 7 && sleep <= 9 ? '✓ Optimal' : sleep < 7 ? 'Under target' : 'Oversleeping'}
            </span>
            <span>12h</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
