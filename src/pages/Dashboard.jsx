import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import { getDailyQuote } from '../utils/quotes';
import { useNavigate } from 'react-router-dom';
import { Flame, Zap, Target, Heart, TrendingUp, DollarSign, Smile, Star } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user, levelData, habits, goals, moods, todayHealth, transactions, todayMood } = useApp();
  const navigate = useNavigate();
  const quote = getDailyQuote();
  const today = new Date().toDateString();

  const completedToday = habits.filter(h => h.completedDates?.includes(today)).length;
  const habitRate = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;

  const activeGoals = goals.filter(g => !g.completed);
  const avgGoalProgress = activeGoals.length > 0
    ? Math.round(activeGoals.reduce((s, g) => s + (g.progress / g.target) * 100, 0) / activeGoals.length)
    : 0;

  const thisMonth = new Date().getMonth();
  const monthTx = transactions.filter(t => new Date(t.date).getMonth() === thisMonth);
  const balance = monthTx.reduce((s, t) => t.type === 'income' ? s + t.amount : s - t.amount, 0);

  const moodEmojis = { happy: '😄', good: '🙂', neutral: '😐', sad: '😞', angry: '😡' };
  const moodColors = { happy: 'emerald', good: 'cyan', neutral: 'blue', sad: 'purple', angry: 'rose' };

  const healthScore = (() => {
    let score = 0;
    if (todayHealth.water >= 8) score += 25;
    else if (todayHealth.water > 0) score += Math.round((todayHealth.water / 8) * 25);
    if (todayHealth.steps >= 10000) score += 25;
    else if (todayHealth.steps > 0) score += Math.round((todayHealth.steps / 10000) * 25);
    if (todayHealth.workout) score += 25;
    if (todayHealth.sleep >= 7 && todayHealth.sleep <= 9) score += 25;
    else if (todayHealth.sleep > 0) score += 15;
    return score;
  })();

  const recentHabits = habits.slice(0, 4);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
              {format(new Date(), 'EEEE, MMMM d')}
            </div>
            <h1 className="font-display font-bold text-3xl lg:text-4xl" style={{ color: 'var(--text-primary)' }}>
              Welcome back, <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #a78bfa, #22d3ee)' }}>{user.name}</span> {user.avatar}
            </h1>
          </div>
          <div className="glass-card px-4 py-3 flex items-center gap-3">
            <div className="text-2xl">⭐</div>
            <div>
              <div className="font-display font-bold text-xl" style={{ color: '#fbbf24' }}>Lv. {levelData.level}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{levelData.title}</div>
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mt-4 glass-card p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-cyan-400" />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {levelData.xpInLevel} / {levelData.xpForLevel} XP to Level {levelData.level + 1}
              </span>
            </div>
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{user.totalXP} total XP</span>
          </div>
          <div className="xp-bar">
            <motion.div className="xp-bar-fill" initial={{ width: 0 }}
              animate={{ width: `${levelData.progress}%` }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} />
          </div>
        </div>
      </motion.div>

      {/* Quote Banner */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="mb-6 p-5 rounded-2xl relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(6,182,212,0.08))', border: '1px solid rgba(139,92,246,0.2)' }}>
        <div className="absolute top-0 right-0 text-8xl opacity-5 font-display font-bold leading-none">"</div>
        <p className="text-sm italic font-medium relative z-10" style={{ color: 'var(--text-primary)' }}>"{quote.text}"</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>— {quote.author}</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="🔥" label="Day Streak" value={`${user.streak}d`} color="amber" delay={0.05} onClick={() => navigate('/habits')} />
        <StatCard icon="💪" label="Habits Today" value={`${completedToday}/${habits.length}`} sub={`${habitRate}%`} progress={habitRate} color="emerald" delay={0.1} onClick={() => navigate('/habits')} />
        <StatCard icon="🎯" label="Goal Progress" value={`${avgGoalProgress}%`} sub={`${activeGoals.length} active`} progress={avgGoalProgress} color="purple" delay={0.15} onClick={() => navigate('/goals')} />
        <StatCard icon={moodEmojis[todayMood?.mood] || '😐'} label="Today's Mood" value={todayMood?.mood || 'Not logged'} color={moodColors[todayMood?.mood] || 'blue'} delay={0.2} onClick={() => navigate('/mood')} />
        <StatCard icon="❤️" label="Health Score" value={`${healthScore}%`} progress={healthScore} color="rose" delay={0.25} onClick={() => navigate('/health')} />
        <StatCard icon="💰" label="Month Balance" value={`₹${balance.toLocaleString()}`} color={balance >= 0 ? 'emerald' : 'rose'} delay={0.3} onClick={() => navigate('/finance')} />
        <StatCard icon="⭐" label="Total XP" value={user.totalXP.toLocaleString()} color="cyan" delay={0.35} />
        <StatCard icon="🏆" label="Achievements" value={user.unlockedAchievements?.length || 0} sub="unlocked" color="amber" delay={0.4} onClick={() => navigate('/achievements')} />
      </div>

      {/* Two Column */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Habits */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold" style={{ color: 'var(--text-primary)' }}>Today's Habits</h3>
            <button onClick={() => navigate('/habits')} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">View all →</button>
          </div>
          <div className="flex flex-col gap-2.5">
            {recentHabits.map(h => {
              const done = h.completedDates?.includes(today);
              return (
                <div key={h.id} className="flex items-center gap-3 p-2.5 rounded-xl transition-all"
                  style={{ background: done ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${done ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
                  <div className="text-lg">{h.icon}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium" style={{ color: done ? '#34d399' : 'var(--text-primary)' }}>{h.name}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>+{h.xp} XP</div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${done ? 'border-emerald-400 bg-emerald-400' : 'border-white/20'}`}>
                    {done && <span className="text-xs text-white">✓</span>}
                  </div>
                </div>
              );
            })}
            {habits.length === 0 && <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No habits yet. Add one!</p>}
          </div>
        </motion.div>

        {/* Active Goals */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold" style={{ color: 'var(--text-primary)' }}>Active Goals</h3>
            <button onClick={() => navigate('/goals')} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">View all →</button>
          </div>
          <div className="flex flex-col gap-3">
            {activeGoals.slice(0, 4).map(g => {
              const pct = Math.round((g.progress / g.target) * 100);
              return (
                <div key={g.id}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{g.title}</span>
                    <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{pct}%</span>
                  </div>
                  <div className="xp-bar" style={{ height: '5px' }}>
                    <motion.div className="xp-bar-fill" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.6, duration: 0.8 }} />
                  </div>
                </div>
              );
            })}
            {activeGoals.length === 0 && <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No active goals. Create your first!</p>}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
