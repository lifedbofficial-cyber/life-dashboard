import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { getLevelProgress } from '../utils/xpSystem';
import { Download, Share2, X, ChevronLeft, ChevronRight } from 'lucide-react';

const MOOD_EMOJI = { 1: '😢', 2: '😕', 3: '😐', 4: '😊', 5: '😄' };
const MOOD_LABEL = { 1: 'Rough', 2: 'Meh', 3: 'Okay', 4: 'Good', 5: 'Amazing' };

function getWeekDates(offset = 0) {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7) + offset * 7);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { monday, sunday };
}

function isInWeek(dateStr, monday, sunday) {
  const d = new Date(dateStr);
  return d >= monday && d <= sunday;
}

export default function WeeklyReport() {
  const { user, habits, goals, moods, transactions, journal, levelData } = useApp();
  const [weekOffset, setWeekOffset] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef(null);

  const { monday, sunday } = getWeekDates(weekOffset);

  const weekLabel = weekOffset === 0
    ? 'This Week'
    : weekOffset === -1
    ? 'Last Week'
    : `Week of ${monday.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;

  const dateRange = `${monday.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} – ${sunday.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  // ── Stats for the week ──────────────────────────────
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i); return d.toDateString();
  });

  const habitsThisWeek = habits.reduce((total, h) => {
    return total + weekDays.filter(d => h.completedDates?.includes(d)).length;
  }, 0);
  const totalPossibleHabits = habits.length * 7;
  const habitRate = totalPossibleHabits > 0 ? Math.round((habitsThisWeek / totalPossibleHabits) * 100) : 0;

  const weekMoods = moods.filter(m => isInWeek(m.date, monday, sunday));
  const avgMood = weekMoods.length > 0
    ? Math.round(weekMoods.reduce((s, m) => s + m.mood, 0) / weekMoods.length)
    : 0;

  const weekTx = transactions.filter(t => isInWeek(t.date, monday, sunday));
  const weekIncome = weekTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const weekExpenses = weekTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const weekJournal = journal.filter(j => isInWeek(j.date, monday, sunday));

  // XP earned this week — approximate from habit completions
  const weekXP = habitsThisWeek * 10 + weekJournal.length * 8 + weekMoods.length * 5;

  // Best habit this week
  const bestHabit = habits.reduce((best, h) => {
    const count = weekDays.filter(d => h.completedDates?.includes(d)).length;
    return count > (best?.count || 0) ? { ...h, count } : best;
  }, null);

  // Day completion breakdown
  const dayBreakdown = weekDays.map((d, i) => {
    const done = habits.filter(h => h.completedDates?.includes(d)).length;
    const pct = habits.length > 0 ? done / habits.length : 0;
    return { day: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i], pct, done, total: habits.length };
  });

  // Grade
  const grade = habitRate >= 90 ? 'S' : habitRate >= 75 ? 'A' : habitRate >= 60 ? 'B' : habitRate >= 40 ? 'C' : 'D';
  const gradeColor = { S: '#fbbf24', A: '#34d399', B: '#22d3ee', C: '#a78bfa', D: '#fb7185' }[grade];

  // Download as image
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
        logging: false,
      });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `life-os-week-${monday.toLocaleDateString('en-CA')}.png`;
      a.click();
    } catch (e) {
      alert('Download failed. Try again!');
    }
    setDownloading(false);
  };

  // Share (Web Share API)
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Week on Life OS',
          text: `I completed ${habitRate}% of my habits this week and earned ${weekXP} XP! 🔥 Check out Life OS: https://life-dashboard-seven-chi.vercel.app`,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(`I completed ${habitRate}% of my habits this week and earned ${weekXP} XP! 🔥 Check out Life OS: https://life-dashboard-seven-chi.vercel.app`);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>Weekly Report</h1>
        <p className="text-sm text-muted">Your performance this week — shareable as an image.</p>
      </motion.div>

      {/* Week Selector */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setWeekOffset(w => w - 1)}
          className="w-9 h-9 rounded-xl flex items-center justify-center btn-secondary">
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{weekLabel}</div>
          <div className="text-xs text-muted">{dateRange}</div>
        </div>
        <button onClick={() => setWeekOffset(w => Math.min(w + 1, 0))}
          disabled={weekOffset === 0}
          className="w-9 h-9 rounded-xl flex items-center justify-center btn-secondary"
          style={{ opacity: weekOffset === 0 ? 0.3 : 1 }}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* ── THE SHAREABLE CARD ── */}
      <motion.div ref={cardRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl overflow-hidden relative"
        style={{
          background: 'linear-gradient(135deg, #0f0a1e 0%, #1a0a2e 40%, #0a1628 100%)',
          border: '1px solid rgba(139,92,246,0.3)',
          padding: 28,
        }}>

        {/* Background decoration */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.15), transparent)', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.1), transparent)', filter: 'blur(40px)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 'bold', color: 'white' }}>◈</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', fontFamily: 'Syne, sans-serif' }}>LIFE OS</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>Weekly Report</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{dateRange}</div>
              <div style={{ fontSize: 12, color: '#a78bfa', fontWeight: 600 }}>{user.name}</div>
            </div>
          </div>

          {/* Grade + XP */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: 18, background: `rgba(${gradeColor === '#fbbf24' ? '251,191,36' : gradeColor === '#34d399' ? '52,211,153' : gradeColor === '#22d3ee' ? '34,211,238' : gradeColor === '#a78bfa' ? '167,139,250' : '251,113,133'},0.15)`, border: `2px solid ${gradeColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: gradeColor, fontFamily: 'Syne, sans-serif' }}>{grade}</span>
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', fontFamily: 'Syne, sans-serif', lineHeight: 1 }}>
                {habitRate}% <span style={{ fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.5)' }}>habit rate</span>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>
                {habitsThisWeek} / {totalPossibleHabits} habits completed
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <span style={{ fontSize: 13, color: '#22d3ee', fontWeight: 600 }}>+{weekXP} XP</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>· Lv.{levelData.level} {levelData.title}</span>
              </div>
            </div>
          </div>

          {/* Day Bars */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Daily Completion</div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 52 }}>
              {dayBreakdown.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: '100%', height: 40, background: 'rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
                    <div style={{ width: '100%', height: `${Math.max(d.pct * 100, d.pct > 0 ? 10 : 0)}%`, background: d.pct >= 1 ? 'linear-gradient(180deg, #8b5cf6, #06b6d4)' : d.pct > 0 ? 'rgba(139,92,246,0.5)' : 'transparent', borderRadius: 6, transition: 'height 0.5s' }} />
                  </div>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
            {[
              { emoji: '😊', label: 'Avg Mood', value: avgMood > 0 ? `${MOOD_EMOJI[avgMood]} ${MOOD_LABEL[avgMood]}` : '—', color: '#fbbf24' },
              { emoji: '💰', label: 'Saved', value: weekExpenses > 0 ? `₹${(weekIncome - weekExpenses).toLocaleString()}` : '—', color: '#34d399' },
              { emoji: '📖', label: 'Journal', value: `${weekJournal.length} entries`, color: '#a78bfa' },
              { emoji: '🔥', label: 'Streak', value: `${user.streak} days`, color: '#f97316' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '10px 8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize: 16, marginBottom: 4 }}>{s.emoji}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: s.color, marginBottom: 2 }}>{s.value}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Best Habit */}
          {bestHabit && bestHabit.count > 0 && (
            <div style={{ background: 'rgba(139,92,246,0.1)', borderRadius: 14, padding: '12px 14px', marginBottom: 16, border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>{bestHabit.icon}</span>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>⭐ Best Habit This Week</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{bestHabit.name}</div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#a78bfa' }}>{bestHabit.count}/7</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>days</div>
              </div>
            </div>
          )}

          {/* Motivational message */}
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
              {habitRate >= 90 ? '🏆 Absolutely crushing it! Legendary week!' :
               habitRate >= 75 ? '🔥 Strong week! Keep the momentum going!' :
               habitRate >= 50 ? '💪 Solid effort. One more push next week!' :
               '🌱 Every journey starts somewhere. Keep going!'}
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>life-dashboard-seven-chi.vercel.app</div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-5">
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={handleDownload} disabled={downloading}
          className="flex-1 btn-primary flex items-center justify-center gap-2 py-3">
          <Download size={16} />
          {downloading ? 'Generating...' : 'Download Image'}
        </motion.button>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={handleShare}
          className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3">
          <Share2 size={16} />
          Share
        </motion.button>
      </div>

      <p className="text-xs text-center text-muted mt-3">Share your progress and inspire others 🚀</p>
    </div>
  );
}