import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Bar, Line, Doughnut, Radar } from 'react-chartjs-2';
import { subDays, format } from 'date-fns';
import { useLifeScore } from '../components/LifeScore';
import { TrendingUp, TrendingDown, Minus, Activity, Zap, Target, Brain, Heart } from 'lucide-react';

// ── Chart Defaults ────────────────────────────────────────────
const TOOLTIP = {
  backgroundColor: 'rgba(10,10,20,0.95)',
  borderColor: 'rgba(255,255,255,0.08)',
  borderWidth: 1,
  padding: 12,
  titleColor: '#f0f0ff',
  bodyColor: '#a78bfa',
  cornerRadius: 10,
};
const AXIS_X = { grid: { display: false }, ticks: { color: 'rgba(240,240,255,0.4)', font: { size: 11 } }, border: { display: false } };
const AXIS_Y = { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(240,240,255,0.4)', font: { size: 11 } }, border: { display: false } };
const RANGE_OPTIONS = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
];
const MOOD_LABELS = ['', '😡 Awful', '😞 Bad', '😐 Okay', '🙂 Good', '😄 Great'];

function SectionTitle({ icon: Icon, title, subtitle, color = '#8b5cf6' }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}35` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div>
        <h2 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
      </div>
    </div>
  );
}

function TrendBadge({ value, suffix = '%' }) {
  if (value === 0) return <span className="flex items-center gap-1 text-xs text-muted"><Minus size={12} /> No change</span>;
  const up = value > 0;
  return (
    <span className="flex items-center gap-1 text-xs font-medium" style={{ color: up ? '#34d399' : '#f43f5e' }}>
      {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {up ? '+' : ''}{value}{suffix}
    </span>
  );
}

function StatPill({ label, value, color, sub }) {
  return (
    <div className="glass-card p-4 flex flex-col gap-1">
      <div className="font-display font-black text-2xl" style={{ color }}>{value}</div>
      <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</div>
      {sub && <div className="text-xs text-muted">{sub}</div>}
    </div>
  );
}

export default function Analytics() {
  const { habits, moods, transactions, health } = useApp();
  const [habitRange, setHabitRange] = useState(7);
  const [financeRange, setFinanceRange] = useState(6); // months
  const { total: lifeScore, breakdown } = useLifeScore();

  // ── Habit completion over selected range ─────────────────────────────
  const habitDays = useMemo(() => {
    return Array.from({ length: habitRange }, (_, i) => {
      const d = subDays(new Date(), habitRange - 1 - i);
      const str = d.toDateString();
      const done = habits.filter(h => h.completedDates?.includes(str)).length;
      const total = habits.length;
      return {
        label: habitRange <= 7 ? format(d, 'EEE') : habitRange <= 30 ? format(d, 'MMM d') : format(d, 'MMM d'),
        rate: total > 0 ? Math.round((done / total) * 100) : 0,
        done,
        total,
      };
    });
  }, [habits, habitRange]);

  const avgHabitRate = Math.round(habitDays.reduce((s, d) => s + d.rate, 0) / habitDays.length) || 0;
  const prevHabitRate = (() => {
    const prev = Array.from({ length: habitRange }, (_, i) => {
      const d = subDays(new Date(), habitRange * 2 - 1 - i);
      const str = d.toDateString();
      const done = habits.filter(h => h.completedDates?.includes(str)).length;
      return habits.length > 0 ? Math.round((done / habits.length) * 100) : 0;
    });
    return Math.round(prev.reduce((s, v) => s + v, 0) / prev.length) || 0;
  })();
  const habitTrend = avgHabitRate - prevHabitRate;

  const habitChartData = {
    labels: habitDays.map(d => d.label),
    datasets: [{
      label: 'Completion %',
      data: habitDays.map(d => d.rate),
      backgroundColor: habitDays.map(d => d.rate >= 80 ? 'rgba(16,185,129,0.55)' : d.rate >= 50 ? 'rgba(139,92,246,0.55)' : 'rgba(244,63,94,0.4)'),
      borderColor: habitDays.map(d => d.rate >= 80 ? '#10b981' : d.rate >= 50 ? '#8b5cf6' : '#f43f5e'),
      borderWidth: 1.5,
      borderRadius: 6,
    }],
  };

  // ── XP Earned Over Time (cumulative, last 30 days) ───────────────────
  const xpTimeline = useMemo(() => {
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = subDays(new Date(), 29 - i);
      const str = d.toDateString();
      const earned = habits.reduce((sum, h) => h.completedDates?.includes(str) ? sum + (h.xp || 10) : sum, 0);
      return { label: format(d, 'MMM d'), earned };
    });
    let cumulative = 0;
    return days.map(d => { cumulative += d.earned; return { label: d.label, cumulative, daily: d.earned }; });
  }, [habits]);

  const xpChartData = {
    labels: xpTimeline.map(d => d.label),
    datasets: [
      {
        label: 'Daily XP',
        data: xpTimeline.map(d => d.daily),
        type: 'bar',
        backgroundColor: 'rgba(139,92,246,0.3)',
        borderColor: '#8b5cf6',
        borderWidth: 1,
        borderRadius: 4,
        yAxisID: 'y1',
        order: 2,
      },
      {
        label: 'Cumulative XP',
        data: xpTimeline.map(d => d.cumulative),
        type: 'line',
        borderColor: '#22d3ee',
        backgroundColor: 'rgba(34,211,238,0.05)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
        yAxisID: 'y',
        order: 1,
      },
    ],
  };

  // ── 14-Day Mood Trend ────────────────────────────────────────────────
  const moodDays = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const d = subDays(new Date(), 13 - i);
    const entry = moods.find(m => m.date === d.toDateString());
    return { label: format(d, 'MMM d'), score: entry ? entry.mood : null };
  }), [moods]);

  const avgMood = (() => {
    const logged = moodDays.filter(d => d.score !== null);
    return logged.length > 0 ? (logged.reduce((s, d) => s + d.score, 0) / logged.length).toFixed(1) : '–';
  })();

  const moodChartData = {
    labels: moodDays.map(d => d.label),
    datasets: [{
      label: 'Mood',
      data: moodDays.map(d => d.score),
      borderColor: '#a78bfa',
      backgroundColor: (ctx) => {
        const chart = ctx.chart;
        const { ctx: c, chartArea } = chart;
        if (!chartArea) return 'transparent';
        const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, 'rgba(167,139,250,0.25)');
        gradient.addColorStop(1, 'rgba(167,139,250,0)');
        return gradient;
      },
      fill: true,
      tension: 0.4,
      pointBackgroundColor: moodDays.map(d => {
        if (!d.score) return 'transparent';
        return d.score >= 4 ? '#34d399' : d.score >= 3 ? '#a78bfa' : '#f43f5e';
      }),
      pointBorderColor: '#080810',
      pointBorderWidth: 2,
      pointRadius: moodDays.map(d => d.score ? 5 : 0),
      spanGaps: true,
    }],
  };

  // ── Health Trends (last 14 days) ─────────────────────────────────────
  const healthDays = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const d = subDays(new Date(), 13 - i);
    const str = d.toDateString();
    const entry = health[str] || {};
    return {
      label: format(d, 'MMM d'),
      water: entry.water || 0,
      steps: (entry.steps || 0) / 1000, // in K
      sleep: entry.sleep || 0,
      workout: entry.workout ? 1 : 0,
    };
  }), [health]);

  const healthChartData = {
    labels: healthDays.map(d => d.label),
    datasets: [
      { label: 'Water (glasses)', data: healthDays.map(d => d.water), borderColor: '#22d3ee', backgroundColor: 'rgba(34,211,238,0.06)', fill: false, tension: 0.4, pointRadius: 3, borderWidth: 2 },
      { label: 'Steps (K)', data: healthDays.map(d => d.steps), borderColor: '#34d399', backgroundColor: 'rgba(52,211,153,0.06)', fill: false, tension: 0.4, pointRadius: 3, borderWidth: 2 },
      { label: 'Sleep (hrs)', data: healthDays.map(d => d.sleep), borderColor: '#a78bfa', backgroundColor: 'rgba(167,139,250,0.06)', fill: false, tension: 0.4, pointRadius: 3, borderWidth: 2 },
    ],
  };

  // ── 6-Month Finance ──────────────────────────────────────────────────
  const finMonths = useMemo(() => Array.from({ length: financeRange }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (financeRange - 1 - i));
    const m = d.getMonth(), y = d.getFullYear();
    const txs = transactions.filter(t => { const td = new Date(t.date); return td.getMonth() === m && td.getFullYear() === y; });
    const income = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
    return { label: format(d, 'MMM'), income, expense, savingsRate };
  }), [transactions, financeRange]);

  const finChartData = {
    labels: finMonths.map(m => m.label),
    datasets: [
      { label: 'Income', data: finMonths.map(m => m.income), backgroundColor: 'rgba(52,211,153,0.55)', borderColor: '#34d399', borderWidth: 1.5, borderRadius: 6 },
      { label: 'Expenses', data: finMonths.map(m => m.expense), backgroundColor: 'rgba(244,63,94,0.45)', borderColor: '#f43f5e', borderWidth: 1.5, borderRadius: 6 },
    ],
  };

  const savingsRateData = {
    labels: finMonths.map(m => m.label),
    datasets: [{
      label: 'Savings Rate %',
      data: finMonths.map(m => m.savingsRate),
      borderColor: '#22d3ee',
      backgroundColor: 'rgba(34,211,238,0.08)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#22d3ee',
      pointBorderColor: '#080810',
      pointBorderWidth: 2,
      pointRadius: 4,
      borderWidth: 2,
    }],
  };

  // ── Habit Categories (Doughnut) ──────────────────────────────────────
  const CATS = ['health', 'mind', 'learning', 'finance', 'spiritual', 'productivity'];
  const CAT_COLORS = ['#34d399', '#a78bfa', '#22d3ee', '#fbbf24', '#fb7185', '#60a5fa'];
  const catCounts = CATS.map(cat => habits.filter(h => h.category === cat).length);
  const catData = {
    labels: CATS.map(c => c.charAt(0).toUpperCase() + c.slice(1)),
    datasets: [{ data: catCounts, backgroundColor: CAT_COLORS.map(c => c + 'aa'), borderColor: CAT_COLORS, borderWidth: 2 }],
  };

  // ── Life Score Radar ─────────────────────────────────────────────────
  const radarData = {
    labels: ['Habits', 'Health', 'Finance', 'Consistency', 'Mood'],
    datasets: [{
      label: 'Your Life Score',
      data: [
        breakdown.find(b => b.label === 'Habits')?.score || 0,
        breakdown.find(b => b.label === 'Health')?.score || 0,
        breakdown.find(b => b.label === 'Finance')?.score || 0,
        Math.min(100, (habits.reduce((s, h) => s + (h.streak || 0), 0) / Math.max(habits.length, 1)) * 10),
        moods.length > 0 ? Math.round((moods.slice(-7).reduce((s, m) => s + m.mood, 0) / Math.min(moods.slice(-7).length, 7)) * 20) : 50,
      ],
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139,92,246,0.12)',
      pointBackgroundColor: '#a78bfa',
      pointBorderColor: '#080810',
      pointBorderWidth: 2,
      borderWidth: 2,
    }],
  };

  // ── Summary Stats ────────────────────────────────────────────────────
  const totalCompleted = habits.reduce((s, h) => s + (h.completedDates?.length || 0), 0);
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak || 0), 0);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto pb-24 lg:pb-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>Analytics</h1>
        <p className="text-sm text-muted">Deep insights into every dimension of your life.</p>
      </motion.div>

      {/* Summary Stat Pills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total Habits Done', value: totalCompleted.toLocaleString(), color: '#34d399', sub: `${habits.length} active habits` },
          { label: '7-Day Avg Rate', value: `${avgHabitRate}%`, color: '#8b5cf6', sub: <TrendBadge value={habitTrend} /> },
          { label: 'Best Habit Streak', value: `${bestStreak}d`, color: '#fbbf24', sub: 'Personal best' },
          { label: 'Avg Mood (14d)', value: avgMood, color: '#a78bfa', sub: `${moods.length} logs total` },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <StatPill {...s} />
          </motion.div>
        ))}
      </div>

      {/* ── Section 1: Habits ───────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 mb-5">
        <div className="flex items-center justify-between mb-5">
          <SectionTitle icon={Activity} title="Habit Completion Rate" subtitle={`${avgHabitRate}% average over ${habitRange} days`} color="#8b5cf6" />
          <div className="flex gap-1.5">
            {RANGE_OPTIONS.map(opt => (
              <button key={opt.label} onClick={() => setHabitRange(opt.days)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: habitRange === opt.days ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${habitRange === opt.days ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  color: habitRange === opt.days ? '#a78bfa' : 'var(--text-muted)',
                }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        {habits.length > 0 ? (
          <Bar data={habitChartData} options={{
            responsive: true,
            plugins: { legend: { display: false }, tooltip: { ...TOOLTIP, callbacks: { label: ctx => ` ${ctx.raw}% complete` } } },
            scales: { x: AXIS_X, y: { ...AXIS_Y, max: 100, min: 0, ticks: { ...AXIS_Y.ticks, callback: v => v + '%' } } },
          }} />
        ) : (
          <div className="flex items-center justify-center h-40 text-sm text-muted">Add habits to see completion trends</div>
        )}
      </motion.div>

      {/* ── Section 2: XP Timeline + Radar ─────────────────── */}
      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
          <SectionTitle icon={Zap} title="XP Earned (30 Days)" subtitle="Daily earnings + cumulative growth" color="#22d3ee" />
          <Bar data={xpChartData} options={{
            responsive: true,
            plugins: { legend: { display: true, labels: { color: 'rgba(240,240,255,0.5)', boxWidth: 10, font: { size: 11 } } }, tooltip: TOOLTIP },
            scales: {
              x: AXIS_X,
              y: { ...AXIS_Y, ticks: { ...AXIS_Y.ticks, callback: v => v + ' XP' } },
              y1: { display: false },
            },
          }} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <SectionTitle icon={Target} title="Life Score Radar" subtitle="Breakdown across 5 key dimensions" color="#a78bfa" />
          <div className="flex justify-center">
            <div style={{ maxWidth: 280, width: '100%' }}>
              <Radar data={radarData} options={{
                responsive: true,
                scales: {
                  r: {
                    min: 0, max: 100,
                    ticks: { display: false, stepSize: 25 },
                    grid: { color: 'rgba(255,255,255,0.07)' },
                    pointLabels: { color: 'rgba(240,240,255,0.55)', font: { size: 11, family: 'DM Sans' } },
                    angleLines: { color: 'rgba(255,255,255,0.06)' },
                  }
                },
                plugins: { legend: { display: false }, tooltip: { ...TOOLTIP, callbacks: { label: ctx => ` ${ctx.raw} / 100` } } },
              }} />
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <div className="text-center">
              <div className="font-display font-black text-3xl" style={{ color: lifeScore >= 75 ? '#10b981' : lifeScore >= 50 ? '#f59e0b' : '#f43f5e' }}>{lifeScore}</div>
              <div className="text-xs text-muted">Today's Life Score</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Section 3: Mood + Health ─────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-6">
          <SectionTitle icon={Brain} title="Mood Trend (14 Days)" subtitle={moods.length > 0 ? `Average: ${avgMood}/5` : 'Start logging to see trends'} color="#a78bfa" />
          {moods.length > 1 ? (
            <Line data={moodChartData} options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                tooltip: { ...TOOLTIP, callbacks: { label: ctx => ctx.raw ? ` ${MOOD_LABELS[ctx.raw] || ctx.raw}` : ' No entry' } },
              },
              scales: {
                x: AXIS_X,
                y: { ...AXIS_Y, min: 0.5, max: 5.5, ticks: { display: false } },
              },
            }} />
          ) : (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <span className="text-4xl">🧘</span>
              <span className="text-sm text-muted">Log moods daily to see your trend</span>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <SectionTitle icon={Heart} title="Health Metrics (14 Days)" subtitle="Water · Steps · Sleep" color="#34d399" />
          {Object.keys(health).length > 0 ? (
            <Line data={healthChartData} options={{
              responsive: true,
              plugins: { legend: { display: true, labels: { color: 'rgba(240,240,255,0.5)', boxWidth: 10, font: { size: 11 } } }, tooltip: TOOLTIP },
              scales: { x: AXIS_X, y: { ...AXIS_Y, min: 0 } },
            }} />
          ) : (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <span className="text-4xl">❤️</span>
              <span className="text-sm text-muted">Log health data to see trends</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Section 4: Finance ───────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-6 mb-5">
        <div className="flex items-center justify-between mb-5">
          <SectionTitle icon={TrendingUp} title="Finance Overview" subtitle="Income vs Expenses" color="#34d399" />
          <div className="flex gap-1.5">
            {[3, 6, 12].map(m => (
              <button key={m} onClick={() => setFinanceRange(m)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: financeRange === m ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${financeRange === m ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: financeRange === m ? '#34d399' : 'var(--text-muted)',
                }}>
                {m}M
              </button>
            ))}
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-5">
          <div>
            <p className="text-xs text-muted mb-3">Income vs Expenses</p>
            {transactions.length > 0 ? (
              <Bar data={finChartData} options={{
                responsive: true,
                plugins: {
                  legend: { display: true, labels: { color: 'rgba(240,240,255,0.5)', boxWidth: 10, font: { size: 11 } } },
                  tooltip: { ...TOOLTIP, callbacks: { label: ctx => ` ₹${ctx.raw.toLocaleString()}` } },
                },
                scales: {
                  x: AXIS_X,
                  y: { ...AXIS_Y, ticks: { ...AXIS_Y.ticks, callback: v => v >= 1000 ? '₹' + (v / 1000).toFixed(0) + 'K' : '₹' + v } },
                },
              }} />
            ) : (
              <div className="flex items-center justify-center h-40 text-sm text-muted">Add transactions to see trends</div>
            )}
          </div>
          <div>
            <p className="text-xs text-muted mb-3">Savings Rate %</p>
            {transactions.length > 0 ? (
              <Line data={savingsRateData} options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  tooltip: { ...TOOLTIP, callbacks: { label: ctx => ` ${ctx.raw}% savings rate` } },
                },
                scales: {
                  x: AXIS_X,
                  y: { ...AXIS_Y, min: -20, max: 100, ticks: { ...AXIS_Y.ticks, callback: v => v + '%' } },
                },
              }} />
            ) : (
              <div className="flex items-center justify-center h-40 text-sm text-muted">No finance data yet</div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Section 5: Habit Categories ─────────────────────── */}
      {habits.length > 0 && catCounts.some(c => c > 0) && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
          <SectionTitle icon={Activity} title="Habit Distribution" subtitle="How your habits are categorized" color="#fbbf24" />
          <div className="grid lg:grid-cols-2 gap-6 items-center">
            <div style={{ maxWidth: 260, margin: '0 auto' }}>
              <Doughnut data={catData} options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  tooltip: { ...TOOLTIP, callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw} habit${ctx.raw !== 1 ? 's' : ''}` } },
                },
                cutout: '65%',
              }} />
            </div>
            <div className="flex flex-col gap-2">
              {CATS.map((cat, i) => catCounts[i] > 0 && (
                <div key={cat} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CAT_COLORS[i] }} />
                  <span className="text-sm flex-1 capitalize" style={{ color: 'var(--text-primary)' }}>{cat}</span>
                  <span className="text-xs font-semibold font-mono" style={{ color: CAT_COLORS[i] }}>{catCounts[i]} habit{catCounts[i] !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
