import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Line } from 'react-chartjs-2';
import { subDays, format } from 'date-fns';

const MOODS = [
  { key: 'happy', emoji: '😄', label: 'Happy', color: '#34d399', score: 5 },
  { key: 'good', emoji: '🙂', label: 'Good', color: '#22d3ee', score: 4 },
  { key: 'neutral', emoji: '😐', label: 'Neutral', color: '#60a5fa', score: 3 },
  { key: 'sad', emoji: '😞', label: 'Sad', color: '#a78bfa', score: 2 },
  { key: 'angry', emoji: '😡', label: 'Angry', color: '#fb7185', score: 1 },
];

export default function MoodTracker() {
  const { moods, logMood, todayMood } = useApp();

  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = subDays(new Date(), 13 - i);
    const str = d.toDateString();
    const entry = moods.find(m => m.date === str);
    const mood = MOODS.find(m => m.key === entry?.mood);
    return { date: format(d, 'MMM d'), score: mood ? mood.score : null, color: mood ? mood.color : '#8b5cf6' };
  });

  const chartData = {
    labels: last14.map(d => d.date),
    datasets: [{
      data: last14.map(d => d.score),
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139,92,246,0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: last14.map(d => d.color),
      pointBorderColor: 'transparent',
      pointRadius: 5,
      pointHoverRadius: 8,
      spanGaps: true,
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const m = MOODS.find(x => x.score === ctx.raw);
            return m ? `${m.emoji} ${m.label}` : '';
          }
        },
        backgroundColor: 'rgba(10,10,20,0.9)',
        borderColor: 'rgba(139,92,246,0.3)',
        borderWidth: 1,
        padding: 10,
        titleColor: '#f0f0ff',
        bodyColor: '#a78bfa',
      }
    },
    scales: {
      y: { min: 0.5, max: 5.5, ticks: { display: false }, grid: { color: 'rgba(255,255,255,0.04)' }, border: { display: false } },
      x: { grid: { display: false }, ticks: { color: 'rgba(240,240,255,0.4)', font: { size: 11 } }, border: { display: false } },
    },
  };

  const moodCounts = MOODS.map(m => ({ ...m, count: moods.filter(e => e.mood === m.key).length }));
  const totalLogs = moods.length;
  const monthLogs = moods.filter(m => new Date(m.timestamp).getMonth() === new Date().getMonth()).length;

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>Mood Tracker</h1>
        <p className="text-sm text-muted">Check in daily. Emotional awareness is a superpower.</p>
      </motion.div>

      {/* Today's Check-in */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 mb-6">
        <h3 className="font-display font-semibold mb-4 text-center" style={{ color: 'var(--text-primary)' }}>
          {todayMood ? `Today you're feeling ${MOODS.find(m => m.key === todayMood.mood)?.label || todayMood.mood}` : "How are you feeling today?"}
        </h3>
        <div className="flex justify-center gap-3 flex-wrap">
          {MOODS.map(m => (
            <motion.button key={m.key} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              onClick={() => logMood(m.key)}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all"
              style={{
                background: todayMood?.mood === m.key ? `${m.color}20` : 'rgba(255,255,255,0.04)',
                border: `2px solid ${todayMood?.mood === m.key ? m.color : 'rgba(255,255,255,0.08)'}`,
                boxShadow: todayMood?.mood === m.key ? `0 0 20px ${m.color}30` : 'none',
                minWidth: 72,
              }}>
              <span className="text-3xl">{m.emoji}</span>
              <span className="text-xs font-medium" style={{ color: todayMood?.mood === m.key ? m.color : 'var(--text-muted)' }}>{m.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Logs', value: totalLogs, color: '#a78bfa' },
          { label: 'This Month', value: monthLogs, color: '#22d3ee' },
          { label: 'Streak', value: moods.length, color: '#34d399' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }} className="glass-card p-4 text-center">
            <div className="font-display font-bold text-2xl mb-1" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-muted">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      {totalLogs > 1 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-5 mb-6">
          <h3 className="font-display font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>14-Day Mood Trend</h3>
          <Line data={chartData} options={chartOptions} />
        </motion.div>
      )}

      {/* Distribution */}
      {totalLogs > 0 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
          <h3 className="font-display font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Mood Distribution</h3>
          <div className="flex flex-col gap-3">
            {moodCounts.map(m => (
              <div key={m.key} className="flex items-center gap-3">
                <span className="text-xl w-8">{m.emoji}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1 text-muted">
                    <span>{m.label}</span>
                    <span>{totalLogs > 0 ? Math.round((m.count / totalLogs) * 100) : 0}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                      animate={{ width: `${totalLogs > 0 ? (m.count / totalLogs) * 100 : 0}%` }}
                      transition={{ delay: 0.4, duration: 0.8 }}
                      style={{ background: m.color }} />
                  </div>
                </div>
                <span className="text-xs font-mono w-6 text-right text-muted">{m.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
