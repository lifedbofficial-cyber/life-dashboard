import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { subDays, format } from 'date-fns';

const TOOLTIP_DEFAULTS = {
  backgroundColor: 'rgba(10,10,20,0.9)',
  borderColor: 'rgba(255,255,255,0.08)',
  borderWidth: 1,
  padding: 12,
  titleColor: '#f0f0ff',
  bodyColor: '#a78bfa',
};

const AXIS_X = { grid: { display: false }, ticks: { color: 'rgba(240,240,255,0.4)', font: { size: 11 } }, border: { display: false } };
const AXIS_Y = { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(240,240,255,0.4)', font: { size: 11 } }, border: { display: false } };

export default function Analytics() {
  const { habits, moods, transactions } = useApp();

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const str = d.toDateString();
    const done = habits.filter(h => h.completedDates?.includes(str)).length;
    const total = habits.length;
    return { label: format(d, 'EEE'), rate: total > 0 ? Math.round((done / total) * 100) : 0 };
  });

  const habitChartData = {
    labels: last7.map(d => d.label),
    datasets: [{
      label: 'Completion %',
      data: last7.map(d => d.rate),
      backgroundColor: last7.map(d => d.rate >= 80 ? 'rgba(16,185,129,0.6)' : d.rate >= 50 ? 'rgba(139,92,246,0.6)' : 'rgba(244,63,94,0.4)'),
      borderColor: last7.map(d => d.rate >= 80 ? '#10b981' : d.rate >= 50 ? '#8b5cf6' : '#f43f5e'),
      borderWidth: 1.5,
      borderRadius: 8,
    }]
  };

  const MOOD_SCORES = { happy: 5, good: 4, neutral: 3, sad: 2, angry: 1 };
  const last14Mood = Array.from({ length: 14 }, (_, i) => {
    const d = subDays(new Date(), 13 - i);
    const entry = moods.find(m => m.date === d.toDateString());
    return { label: format(d, 'MMM d'), score: entry ? MOOD_SCORES[entry.mood] : null };
  });

  const moodChartData = {
    labels: last14Mood.map(d => d.label),
    datasets: [{
      label: 'Mood',
      data: last14Mood.map(d => d.score),
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139,92,246,0.08)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#8b5cf6',
      pointBorderColor: '#080810',
      pointBorderWidth: 2,
      pointRadius: 4,
      spanGaps: true,
    }]
  };

  const months6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const m = d.getMonth(), y = d.getFullYear();
    const txs = transactions.filter(t => { const td = new Date(t.date); return td.getMonth() === m && td.getFullYear() === y; });
    return {
      label: format(d, 'MMM'),
      income: txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    };
  });

  const finChartData = {
    labels: months6.map(m => m.label),
    datasets: [
      { label: 'Income', data: months6.map(m => m.income), backgroundColor: 'rgba(16,185,129,0.6)', borderColor: '#10b981', borderWidth: 1.5, borderRadius: 6 },
      { label: 'Expenses', data: months6.map(m => m.expense), backgroundColor: 'rgba(244,63,94,0.5)', borderColor: '#f43f5e', borderWidth: 1.5, borderRadius: 6 },
    ]
  };

  const CATS = ['health', 'mind', 'learning', 'finance', 'spiritual', 'productivity'];
  const CAT_COLORS = ['#34d399', '#a78bfa', '#22d3ee', '#fbbf24', '#fb7185', '#60a5fa'];
  const catData = {
    labels: CATS.map(c => c.charAt(0).toUpperCase() + c.slice(1)),
    datasets: [{
      data: CATS.map(cat => habits.filter(h => h.category === cat).length),
      backgroundColor: CAT_COLORS.map(c => c + '99'),
      borderColor: CAT_COLORS,
      borderWidth: 2,
    }]
  };

  const barOpts = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: TOOLTIP_DEFAULTS },
    scales: { x: AXIS_X, y: { ...AXIS_Y, max: 100, ticks: { ...AXIS_Y.ticks, callback: v => v + '%' } } },
  };
  const lineOpts = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { ...TOOLTIP_DEFAULTS, callbacks: { label: ctx => ['', '😡', '😞', '😐', '🙂', '😄'][ctx.raw] || '' } } },
    scales: { x: AXIS_X, y: { ...AXIS_Y, min: 0.5, max: 5.5, ticks: { display: false } } },
  };
  const groupedOpts = {
    responsive: true,
    plugins: { legend: { display: true, labels: { color: 'rgba(240,240,255,0.6)', boxWidth: 12, font: { size: 11 } } }, tooltip: { ...TOOLTIP_DEFAULTS, callbacks: { label: ctx => ` ₹${ctx.raw.toLocaleString()}` } } },
    scales: { x: AXIS_X, y: { ...AXIS_Y, ticks: { ...AXIS_Y.ticks, callback: v => v >= 1000 ? '₹' + (v/1000).toFixed(0) + 'K' : '₹' + v } } },
  };
  const donutOpts = {
    responsive: true,
    plugins: { legend: { display: true, position: 'bottom', labels: { color: 'rgba(240,240,255,0.6)', boxWidth: 12, padding: 12, font: { size: 11 } } }, tooltip: TOOLTIP_DEFAULTS },
    cutout: '60%',
  };

  const totalCompleted = habits.reduce((s, h) => s + (h.completedDates?.length || 0), 0);
  const avgRate = last7.reduce((s, d) => s + d.rate, 0) / 7;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>Analytics</h1>
        <p className="text-sm text-muted">Data-driven insights into your life performance.</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Habits Done', value: totalCompleted, color: '#34d399' },
          { label: '7-Day Avg Rate', value: `${Math.round(avgRate)}%`, color: '#8b5cf6' },
          { label: 'Active Habits', value: habits.length, color: '#fbbf24' },
          { label: 'Mood Logs', value: moods.length, color: '#22d3ee' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
            <div className="font-display font-bold text-2xl mb-0.5" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-muted">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5">
          <h3 className="font-display font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>7-Day Habit Completion</h3>
          <Bar data={habitChartData} options={barOpts} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
          <h3 className="font-display font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>14-Day Mood Trend</h3>
          {moods.length > 1 ? <Line data={moodChartData} options={lineOpts} /> : (
            <div className="flex items-center justify-center h-40 text-sm text-muted">Log moods to see trends</div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-5">
          <h3 className="font-display font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>6-Month Finance</h3>
          {transactions.length > 0 ? <Bar data={finChartData} options={groupedOpts} /> : (
            <div className="flex items-center justify-center h-40 text-sm text-muted">Add transactions to see trends</div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
          <h3 className="font-display font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Habit Categories</h3>
          {habits.length > 0 ? <Doughnut data={catData} options={donutOpts} /> : (
            <div className="flex items-center justify-center h-40 text-sm text-muted">Add habits to see distribution</div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
