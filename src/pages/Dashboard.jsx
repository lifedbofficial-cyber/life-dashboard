import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { getLevelProgress } from '../utils/xpSystem';
import { useNavigate } from 'react-router-dom';
import LifeScore, { useLifeScore } from '../components/LifeScore';
import { Flame, Target, DollarSign, Brain, ChevronRight, TrendingUp, TrendingDown, Zap, CheckCircle2, Circle } from 'lucide-react';

function Skeleton({ className }) {
  return (
    <div className={`rounded-xl animate-pulse ${className}`}
      style={{ background: 'rgba(255,255,255,0.06)' }} />
  );
}

function StatCard({ icon, label, value, sub, color, to, delay = 0 }) {
  const navigate = useNavigate();
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
      onClick={() => navigate(to)}
      className="glass-card p-4 cursor-pointer group relative overflow-hidden">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ background: `radial-gradient(circle at top left, ${color}10, transparent 60%)` }} />
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          {icon}
        </div>
        <ChevronRight size={14} className="opacity-0 group-hover:opacity-50 transition-opacity mt-1" style={{ color }} />
      </div>
      <div className="font-display font-bold text-2xl mb-0.5" style={{ color: 'var(--text-primary)' }}>{value}</div>
      <div className="text-xs font-medium" style={{ color }}>{label}</div>
      {sub && <div className="text-xs text-muted mt-0.5">{sub}</div>}
    </motion.div>
  );
}

function AIInsightCard({ insight, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}
      className="flex items-start gap-3 p-3 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="text-xl flex-shrink-0 mt-0.5">{insight.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold mb-0.5" style={{ color: insight.color || 'var(--text-primary)' }}>{insight.title}</div>
        <div className="text-xs text-muted leading-relaxed">{insight.message}</div>
      </div>
      {insight.badge && (
        <div className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium"
          style={{ background: `${insight.color || '#8b5cf6'}20`, color: insight.color || '#a78bfa', border: `1px solid ${insight.color || '#8b5cf6'}30` }}>
          {insight.badge}
        </div>
      )}
    </motion.div>
  );
}

function generateInsights(habits, transactions, moods, health, user) {
  const insights = [];
  const today = new Date().toDateString();
  const thisMonth = new Date().getMonth();

  // Habit insights
  const todayDone = habits.filter(h => h.completedDates?.includes(today)).length;
  const remaining = habits.length - todayDone;
  if (remaining > 0) {
    insights.push({ icon: '🔥', title: 'Habits pending', message: `${remaining} habit${remaining > 1 ? 's' : ''} left for today. Complete them to boost your Life Score!`, color: '#f97316', badge: `${todayDone}/${habits.length}` });
  } else if (habits.length > 0) {
    insights.push({ icon: '🏆', title: 'Perfect day!', message: 'All habits completed! Your streak is safe. Keep going tomorrow!', color: '#10b981', badge: '100%' });
  }

  // Streak insight
  if (user.streak >= 7) {
    insights.push({ icon: '⚡', title: `${user.streak}-day streak!`, message: "You're on fire! Consistency is your superpower.", color: '#f59e0b', badge: '🔥' });
  } else if (user.streak === 0) {
    insights.push({ icon: '🌱', title: 'Start your streak', message: 'Complete at least one habit today to begin a new streak!', color: '#8b5cf6' });
  }

  // Finance insights
  const monthTx = transactions.filter(t => new Date(t.date).getMonth() === thisMonth);
  const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  if (expenses > income && income > 0) {
    insights.push({ icon: '⚠️', title: 'Overspending alert', message: `You've spent ₹${(expenses - income).toLocaleString()} more than earned this month. Consider cutting back.`, color: '#f43f5e', badge: 'Finance' });
  } else if (income > 0 && expenses < income * 0.5) {
    insights.push({ icon: '💰', title: 'Great savings!', message: `You're saving ${Math.round(((income - expenses) / income) * 100)}% of your income. Excellent financial discipline!`, color: '#10b981', badge: 'Finance' });
  }

  // Mood insights
  const weekMoods = moods.slice(-7);
  if (weekMoods.length > 0) {
    const avg = weekMoods.reduce((s, m) => s + m.mood, 0) / weekMoods.length;
    if (avg < 3) {
      insights.push({ icon: '💙', title: 'Low mood detected', message: "Your mood has been low lately. Try a short walk, journaling, or reaching out to a friend.", color: '#06b6d4' });
    } else if (avg >= 4) {
      insights.push({ icon: '😄', title: 'You\'re thriving!', message: "Your mood has been consistently positive this week. Whatever you're doing, keep it up!", color: '#34d399' });
    }
  }

  // Health
  const todayHealth = health[today] || {};
  if (!todayHealth.logged) {
    insights.push({ icon: '❤️', title: 'Log your health', message: 'Track your water, steps, sleep, and workout to earn +10 XP and improve your Life Score.', color: '#fb7185' });
  }

  return insights.slice(0, 4);
}

export default function Dashboard() {
  const { user, habits, goals, transactions, moods, health, levelData, dataLoaded } = useApp();
  const navigate = useNavigate();
  const { total: lifeScore } = useLifeScore();
  const today = new Date().toDateString();
  const thisMonth = new Date().getMonth();

  const todayHabits = habits.filter(h => h.completedDates?.includes(today)).length;
  const activeGoals = goals.filter(g => !g.completed).length;
  const monthTx = transactions.filter(t => new Date(t.date).getMonth() === thisMonth);
  const monthExpenses = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const monthIncome = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);

  const insights = generateInsights(habits, transactions, moods, health, user);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (!dataLoaded) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="mb-8"><Skeleton className="h-8 w-48 mb-2" /><Skeleton className="h-4 w-64" /></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-5">
          <Skeleton className="h-64" /><Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto pb-24 lg:pb-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">{user.avatar}</span>
          <div>
            <h1 className="font-display font-bold text-2xl lg:text-3xl" style={{ color: 'var(--text-primary)' }}>
              {greeting}, <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #a78bfa, #22d3ee)' }}>{user.name}</span> 👋
            </h1>
            <p className="text-sm text-muted">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
              {' · '}Lv.{levelData.level} {levelData.title}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon="🔥" label="Habits Today" value={`${todayHabits}/${habits.length}`}
          sub={todayHabits === habits.length && habits.length > 0 ? '✅ All done!' : `${habits.length - todayHabits} remaining`}
          color="#f97316" to="/habits" delay={0.05} />
        <StatCard icon="🎯" label="Active Goals" value={activeGoals}
          sub={`${goals.filter(g => g.completed).length} completed`}
          color="#8b5cf6" to="/goals" delay={0.1} />
        <StatCard icon="⭐" label="Total XP" value={user.totalXP.toLocaleString()}
          sub={`${levelData.xpForLevel} XP to next level`}
          color="#22d3ee" to="/achievements" delay={0.15} />
        <StatCard icon="🔥" label="Day Streak" value={user.streak}
          sub={user.streak >= 7 ? '🏆 On fire!' : 'Keep going!'}
          color="#fbbf24" to="/habits" delay={0.2} />
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* Life Score */}
        <LifeScore />

        {/* AI Insights */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
              <Brain size={15} className="text-purple-400" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>AI Insights</h3>
              <p className="text-xs text-muted">Personalized for you</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {insights.length > 0
              ? insights.map((ins, i) => <AIInsightCard key={i} insight={ins} delay={0.3 + i * 0.08} />)
              : <p className="text-sm text-center py-4 text-muted">Start logging data to get AI insights!</p>}
          </div>
        </motion.div>
      </div>

      {/* Finance + Quick Habits */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Finance Snapshot */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card p-5 cursor-pointer group" onClick={() => navigate('/finance')}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Finance This Month</h3>
            <ChevronRight size={14} className="text-muted group-hover:text-purple-400 transition-colors" />
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Income', value: monthIncome, color: '#34d399', icon: <TrendingUp size={14} /> },
              { label: 'Expenses', value: monthExpenses, color: '#fb7185', icon: <TrendingDown size={14} /> },
              { label: 'Saved', value: Math.max(monthIncome - monthExpenses, 0), color: '#22d3ee', icon: <Zap size={14} /> },
            ].map(s => (
              <div key={s.label} className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex justify-center mb-1" style={{ color: s.color }}>{s.icon}</div>
                <div className="font-display font-bold text-sm truncate" style={{ color: s.color }}>₹{s.value.toLocaleString()}</div>
                <div className="text-xs text-muted">{s.label}</div>
              </div>
            ))}
          </div>
          {monthIncome > 0 && (
            <div>
              <div className="flex justify-between text-xs mb-1 text-muted">
                <span>Savings rate</span>
                <span className="font-mono" style={{ color: '#22d3ee' }}>{Math.round(Math.max((monthIncome - monthExpenses) / monthIncome, 0) * 100)}%</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                  animate={{ width: `${Math.min(Math.max((monthIncome - monthExpenses) / monthIncome, 0) * 100, 100)}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  style={{ background: 'linear-gradient(90deg, #22d3ee, #10b981)' }} />
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Habit Check */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Today's Habits</h3>
            <button onClick={() => navigate('/habits')} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">View all</button>
          </div>
          {habits.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-3xl mb-2">🌱</div>
              <p className="text-xs text-muted">No habits yet</p>
              <button onClick={() => navigate('/habits')} className="btn-primary text-xs mt-3 px-4 py-2">Add Habits</button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {habits.slice(0, 5).map(h => {
                const done = h.completedDates?.includes(today);
                return (
                  <div key={h.id} className="flex items-center gap-3 p-2.5 rounded-xl transition-all"
                    style={{ background: done ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)', border: `1px solid ${done ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
                    <span className="text-lg">{h.icon}</span>
                    <span className="flex-1 text-sm" style={{ color: done ? '#34d399' : 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.7 : 1 }}>{h.name}</span>
                    {done
                      ? <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
                      : <Circle size={18} className="flex-shrink-0" style={{ color: 'rgba(255,255,255,0.15)' }} />}
                  </div>
                );
              })}
              {habits.length > 5 && (
                <button onClick={() => navigate('/habits')} className="text-xs text-center text-muted hover:text-purple-400 transition-colors py-1">
                  +{habits.length - 5} more habits →
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}