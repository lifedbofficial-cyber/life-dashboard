import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Tooltip, Filler
} from 'chart.js'
import { subDays, format } from 'date-fns'
import toast from 'react-hot-toast'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

const MOODS = [
  { key: 'happy', emoji: '😄', label: 'Happy', color: '#10B981', value: 5 },
  { key: 'good', emoji: '🙂', label: 'Good', color: '#3B82F6', value: 4 },
  { key: 'neutral', emoji: '😐', label: 'Neutral', color: '#F59E0B', value: 3 },
  { key: 'sad', emoji: '😞', label: 'Sad', color: '#8B5CF6', value: 2 },
  { key: 'angry', emoji: '😡', label: 'Angry', color: '#EF4444', value: 1 },
]

const MOOD_VALUE = { happy: 5, good: 4, neutral: 3, sad: 2, angry: 1 }
const MOOD_LABELS = { 5: 'Happy', 4: 'Good', 3: 'Neutral', 2: 'Sad', 1: 'Angry' }

export default function Mood() {
  const { moods, logMood } = useStore()
  const [selectedMood, setSelectedMood] = useState(null)
  const [note, setNote] = useState('')
  const [range, setRange] = useState(7)
  const today = new Date().toISOString().split('T')[0]
  const todayEntry = moods.find(m => m.date === today)

  const handleLog = () => {
    if (!selectedMood) return
    logMood(selectedMood, note)
    toast.success('Mood logged! 🧘', { style: { background: '#111827', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } })
    setNote('')
  }

  // Chart data
  const days = Array.from({ length: range }, (_, i) => {
    const d = subDays(new Date(), range - 1 - i)
    const dateStr = d.toISOString().split('T')[0]
    const entry = moods.find(m => m.date === dateStr)
    return {
      label: format(d, range <= 7 ? 'EEE' : 'MMM d'),
      value: entry ? MOOD_VALUE[entry.mood] : null,
      mood: entry?.mood,
    }
  })

  const chartData = {
    labels: days.map(d => d.label),
    datasets: [{
      label: 'Mood',
      data: days.map(d => d.value),
      borderColor: '#A78BFA',
      backgroundColor: 'rgba(124,58,237,0.08)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: days.map(d => {
        const mood = MOODS.find(m => m.key === d.mood)
        return mood ? mood.color : '#ffffff30'
      }),
      pointBorderColor: 'transparent',
      pointRadius: 6,
      pointHoverRadius: 8,
      spanGaps: true,
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0, max: 6,
        ticks: {
          stepSize: 1,
          color: '#ffffff40',
          font: { family: 'JetBrains Mono', size: 10 },
          callback: v => MOOD_LABELS[v] || '',
        },
        grid: { color: 'rgba(255,255,255,0.04)' },
        border: { display: false },
      },
      x: {
        ticks: { color: '#ffffff40', font: { family: 'JetBrains Mono', size: 10 } },
        grid: { display: false },
        border: { display: false },
      }
    },
    plugins: { legend: { display: false }, tooltip: {
      backgroundColor: '#111827',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      titleColor: '#ffffff80',
      bodyColor: '#ffffff',
      callbacks: {
        label: (ctx) => ` ${MOOD_LABELS[ctx.raw] || 'No entry'}`,
      }
    }}
  }

  // Stats
  const logged = moods.filter(m => {
    const d = new Date(m.date)
    const cutoff = subDays(new Date(), range)
    return d >= cutoff
  })
  const avgMood = logged.length ? (logged.reduce((s, m) => s + MOOD_VALUE[m.mood], 0) / logged.length).toFixed(1) : '—'
  const dominantMood = logged.length
    ? MOODS.find(m => m.key === logged.reduce((acc, cur) => {
        acc[cur.mood] = (acc[cur.mood] || 0) + 1
        return acc
      }, {}) && Object.entries(logged.reduce((acc, cur) => { acc[cur.mood] = (acc[cur.mood] || 0) + 1; return acc }, {})).sort((a, b) => b[1] - a[1])[0]?.[0])
    : null

  return (
    <div className="page-container">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-white mb-1">Mood Tracker</h1>
        <p className="text-white/40 text-sm">Understand your emotional patterns.</p>
      </div>

      {/* Log Today's Mood */}
      <div className="glass-card p-6">
        <div className="text-sm font-medium text-white mb-1">
          {todayEntry ? 'Update today\'s mood' : 'How are you feeling today?'}
        </div>
        <div className="text-xs text-white/30 mb-4">
          {todayEntry ? `Currently: ${MOODS.find(m => m.key === todayEntry.mood)?.emoji} ${todayEntry.mood}` : 'Select your current mood'}
        </div>

        <div className="flex gap-3 flex-wrap mb-4">
          {MOODS.map((mood) => (
            <motion.button
              key={mood.key}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedMood(mood.key)}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all min-w-[70px]
                ${selectedMood === mood.key
                  ? 'border-opacity-100 scale-110'
                  : todayEntry?.mood === mood.key
                    ? 'border-opacity-50'
                    : 'border-white/10 hover:border-white/20'}`}
              style={{
                borderColor: selectedMood === mood.key ? mood.color : todayEntry?.mood === mood.key ? mood.color + '80' : undefined,
                background: selectedMood === mood.key ? `${mood.color}15` : todayEntry?.mood === mood.key ? `${mood.color}08` : undefined,
                boxShadow: selectedMood === mood.key ? `0 0 20px ${mood.color}30` : undefined,
              }}
            >
              <span className="text-2xl">{mood.emoji}</span>
              <span className="text-[10px] text-white/60">{mood.label}</span>
            </motion.button>
          ))}
        </div>

        <div className="flex gap-3">
          <input
            className="input-field flex-1"
            placeholder="Add a note (optional)..."
            value={note}
            onChange={e => setNote(e.target.value)}
          />
          <button onClick={handleLog} disabled={!selectedMood} className="btn-primary px-5 disabled:opacity-40 disabled:cursor-not-allowed">
            Log Mood
          </button>
        </div>
      </div>

      {/* Analytics */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="section-title">Mood Trends</div>
          <div className="flex gap-1">
            {[7, 14, 30].map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={`text-xs px-3 py-1 rounded-lg transition-all ${range === r ? 'bg-accent-purple/30 text-accent-purple-light border border-accent-purple/40' : 'text-white/30 hover:text-white'}`}>
                {r}d
              </button>
            ))}
          </div>
        </div>
        <div style={{ height: 200 }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl mb-1">{MOODS.find(m => m.value === Math.round(parseFloat(avgMood)))?.emoji || '📊'}</div>
          <div className="font-display text-lg font-bold text-white">{avgMood}</div>
          <div className="text-[10px] text-white/30 mt-0.5">Avg Mood ({range}d)</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl mb-1">📅</div>
          <div className="font-display text-lg font-bold text-white">{logged.length}</div>
          <div className="text-[10px] text-white/30 mt-0.5">Days Tracked</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl mb-1">{moods.length > 0 ? '🔥' : '💤'}</div>
          <div className="font-display text-lg font-bold text-white">{moods.length}</div>
          <div className="text-[10px] text-white/30 mt-0.5">Total Entries</div>
        </div>
      </div>

      {/* History */}
      {moods.length > 0 && (
        <div className="glass-card p-5">
          <div className="section-title mb-3">Recent Entries</div>
          <div className="space-y-2">
            {[...moods].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10).map((entry) => {
              const mood = MOODS.find(m => m.key === entry.mood)
              return (
                <div key={entry.date} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
                    style={{ background: `${mood?.color}15` }}>
                    {mood?.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white/80">{mood?.label}</div>
                    {entry.note && <div className="text-xs text-white/30 mt-0.5">{entry.note}</div>}
                  </div>
                  <div className="text-[10px] font-mono text-white/30">{entry.date}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
