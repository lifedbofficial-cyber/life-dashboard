import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

function getScoreColor(score) {
  if (score >= 75) return { stroke: '#10b981', glow: 'rgba(16,185,129,0.4)', label: 'Excellent', bg: 'rgba(16,185,129,0.08)' };
  if (score >= 50) return { stroke: '#f59e0b', glow: 'rgba(245,158,11,0.4)', label: 'Good', bg: 'rgba(245,158,11,0.08)' };
  if (score >= 25) return { stroke: '#f97316', glow: 'rgba(249,115,22,0.4)', label: 'Fair', bg: 'rgba(249,115,22,0.08)' };
  return { stroke: '#f43f5e', glow: 'rgba(244,63,94,0.4)', label: 'Low', bg: 'rgba(244,63,94,0.08)' };
}

function RingScore({ score, size = 120, stroke = 10 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const { stroke: color, glow } = getScoreColor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${glow})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="font-display font-black"
          style={{ fontSize: size * 0.22, color, lineHeight: 1 }}>
          {score}
        </motion.div>
        <div className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)', fontSize: size * 0.085 }}>/ 100</div>
      </div>
    </div>
  );
}

export function useLifeScore() {
  const { habits, transactions, moods, health } = useApp();
  const today = new Date().toDateString();
  const thisMonth = new Date().getMonth();

  return useMemo(() => {
    // ── Habits score (40%) ──
    const todayHabits = habits.filter(h => h.completedDates?.includes(today)).length;
    const habitScore = habits.length > 0 ? (todayHabits / habits.length) * 100 : 0;

    // ── Health score (30%) ──
    const todayHealth = health[today] || {};
    let healthScore = 0;
    if (todayHealth.water >= 8) healthScore += 25;
    else if (todayHealth.water > 0) healthScore += (todayHealth.water / 8) * 25;
    if (todayHealth.steps >= 10000) healthScore += 25;
    else if (todayHealth.steps > 0) healthScore += (todayHealth.steps / 10000) * 25;
    if (todayHealth.sleep >= 7 && todayHealth.sleep <= 9) healthScore += 25;
    else if (todayHealth.sleep > 0) healthScore += 15;
    if (todayHealth.workout) healthScore += 25;

    // ── Finance score (30%) ──
    const monthTx = transactions.filter(t => new Date(t.date).getMonth() === thisMonth);
    const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    let financeScore = 50; // neutral default
    if (income > 0) {
      const savingsRate = (income - expenses) / income;
      financeScore = Math.min(100, Math.max(0, savingsRate * 100 + 30));
    }

    const total = Math.round(habitScore * 0.4 + healthScore * 0.3 + financeScore * 0.3);

    // Breakdown
    const breakdown = [
      { label: 'Habits', score: Math.round(habitScore), weight: '40%', color: '#8b5cf6' },
      { label: 'Health', score: Math.round(healthScore), weight: '30%', color: '#06b6d4' },
      { label: 'Finance', score: Math.round(financeScore), weight: '30%', color: '#10b981' },
    ];

    // Tips
    const tips = [];
    if (habitScore < 50) tips.push({ icon: '🔥', text: `Complete ${habits.length - todayHabits} more habits to boost your score` });
    if (!todayHealth.workout) tips.push({ icon: '💪', text: 'Log your workout for +25 health points' });
    if ((todayHealth.water || 0) < 8) tips.push({ icon: '💧', text: `Drink ${8 - (todayHealth.water || 0)} more glasses of water` });
    if (financeScore < 50) tips.push({ icon: '💰', text: 'Your expenses exceed income this month' });
    if (tips.length === 0) tips.push({ icon: '🏆', text: 'Amazing day! Keep up the momentum!' });

    return { total, breakdown, tips, habitScore: Math.round(habitScore), healthScore: Math.round(healthScore), financeScore: Math.round(financeScore) };
  }, [habits, transactions, health, today, thisMonth]);
}

export default function LifeScore({ compact = false }) {
  const { total, breakdown, tips } = useLifeScore();
  const colors = getScoreColor(total);

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <RingScore score={total} size={56} stroke={5} />
        <div>
          <div className="text-xs text-muted">Life Score</div>
          <div className="font-display font-bold text-sm" style={{ color: colors.stroke }}>{colors.label}</div>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${colors.bg}, transparent 60%)` }} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Life Score™</h3>
            <p className="text-xs text-muted">Today's performance</p>
          </div>
          <div className="text-xs px-3 py-1.5 rounded-full font-semibold" style={{ background: colors.bg, color: colors.stroke, border: `1px solid ${colors.stroke}40` }}>
            {colors.label}
          </div>
        </div>

        <div className="flex items-center gap-6 mb-6">
          <RingScore score={total} size={110} stroke={9} />
          <div className="flex-1">
            {breakdown.map(b => (
              <div key={b.label} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">{b.label} <span style={{ color: 'rgba(255,255,255,0.25)' }}>({b.weight})</span></span>
                  <span className="font-mono font-bold" style={{ color: b.color }}>{b.score}</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <motion.div className="h-full rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${b.score}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    style={{ background: b.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="flex flex-col gap-2">
          {tips.slice(0, 2).map((tip, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-center gap-2.5 p-2.5 rounded-xl text-xs"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span>{tip.icon}</span>
              <span style={{ color: 'var(--text-muted)' }}>{tip.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}