import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { BrainCircuit, Send, Sparkles, RefreshCw } from 'lucide-react'
import { subDays } from 'date-fns'

const MOOD_VALUE = { happy: 5, good: 4, neutral: 3, sad: 2, angry: 1 }

function generateInsights(state) {
  const { habits, moods, health, transactions, journal, user, getLevelData } = state
  const { level } = getLevelData()
  const today = new Date().toISOString().split('T')[0]
  const last7 = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i).toISOString().split('T')[0])

  const insights = []

  // Habit insights
  const weeklyCompletion = habits.length > 0
    ? habits.filter(h => last7.some(d => h.completedDates.includes(d))).length / habits.length
    : 0

  const todayDone = habits.filter(h => h.completedDates.includes(today)).length
  const totalHabits = habits.length

  if (weeklyCompletion < 0.5 && totalHabits > 0) {
    insights.push({
      type: 'warning',
      icon: '⚡',
      title: 'Habit Momentum Dropping',
      message: `You completed only ${Math.round(weeklyCompletion * 100)}% of your habits this week. Try focusing on your top 2 habits tomorrow — small wins build momentum.`,
      action: 'Go to Habits',
      route: '/habits',
    })
  } else if (weeklyCompletion >= 0.8) {
    insights.push({
      type: 'success',
      icon: '🔥',
      title: 'On Fire This Week!',
      message: `${Math.round(weeklyCompletion * 100)}% habit completion rate this week! You're building serious discipline. Keep the streak alive.`,
      action: null,
    })
  }

  // Streak insight
  if (user.streak >= 7) {
    insights.push({
      type: 'success',
      icon: '🏆',
      title: `${user.streak}-Day Streak!`,
      message: `Incredible consistency! A ${user.streak}-day streak puts you in the top 10% of performers. Protect your streak — it's your most valuable asset.`,
    })
  }

  // Mood insights
  const recentMoods = moods.filter(m => last7.includes(m.date))
  if (recentMoods.length >= 3) {
    const avgMood = recentMoods.reduce((s, m) => s + MOOD_VALUE[m.mood], 0) / recentMoods.length
    if (avgMood < 3) {
      insights.push({
        type: 'care',
        icon: '🧘',
        title: 'Your Mood Needs Attention',
        message: `Your average mood this week has been below neutral. Consider adding a short meditation habit, getting outside, or reaching out to someone you trust. Small actions compound.`,
        action: 'Track Mood',
        route: '/mood',
      })
    } else if (avgMood >= 4.5) {
      insights.push({
        type: 'success',
        icon: '😄',
        title: 'Exceptional Mood Streak',
        message: `Your mood has been consistently high this week — average ${avgMood.toFixed(1)}/5. What's working? Journal it to remember and replicate.`,
        action: 'Write in Journal',
        route: '/journal',
      })
    }
  }

  // Health insights
  const todayHealth = health.find(h => h.date === today)
  if (todayHealth) {
    if (todayHealth.sleep < 6) {
      insights.push({
        type: 'warning',
        icon: '😴',
        title: 'Sleep Deficit Alert',
        message: `You slept only ${todayHealth.sleep} hours last night. Research shows that less than 6 hours significantly impairs decision-making and productivity. Prioritize 7-9 hours tonight.`,
      })
    }
    if (todayHealth.steps < 3000) {
      insights.push({
        type: 'tip',
        icon: '🚶',
        title: 'Get Moving Today',
        message: `Only ${todayHealth.steps?.toLocaleString()} steps so far. A 20-minute walk can boost energy, mood and creativity. Try stepping out between tasks.`,
      })
    }
  }

  // Finance insights
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const savings = transactions.filter(t => t.type === 'savings').reduce((s, t) => s + t.amount, 0)
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  if (income > 0) {
    const savingsRate = savings / income
    if (savingsRate >= 0.2) {
      insights.push({
        type: 'success',
        icon: '💰',
        title: 'Saving Like a Pro',
        message: `You're saving ${Math.round(savingsRate * 100)}% of your income — well above the recommended 20%. Compound growth will reward your discipline significantly.`,
      })
    } else if (savingsRate < 0.1 && income > 0) {
      insights.push({
        type: 'tip',
        icon: '💡',
        title: 'Boost Your Savings Rate',
        message: `Your savings rate is ${Math.round(savingsRate * 100)}%. Aim for 20%+ by automating transfers on payday. Even ₹500 more per week = ₹26,000/year.`,
        action: 'Track Finance',
        route: '/finance',
      })
    }
  }

  // Journal insights
  if (journal.length === 0) {
    insights.push({
      type: 'tip',
      icon: '✍️',
      title: 'Start Your Story',
      message: `You haven't written a journal entry yet. Daily journaling for just 5 minutes has been shown to reduce stress by 28% and improve self-awareness dramatically.`,
      action: 'Write First Entry',
      route: '/journal',
    })
  }

  // Level up motivation
  const { xp, xpToNext } = getLevelData()
  if (xp / xpToNext > 0.8) {
    insights.push({
      type: 'motivation',
      icon: '⭐',
      title: `Almost Level ${level + 1}!`,
      message: `You're ${xpToNext - xp} XP away from leveling up. Complete 2-3 habits today to push through. Every action compounds into your next level.`,
    })
  }

  // Default if nothing
  if (insights.length === 0) {
    insights.push({
      type: 'motivation',
      icon: '🚀',
      title: 'Ready to Optimize?',
      message: `Your data looks good. Keep tracking your habits, moods and health to unlock personalized insights. The more data you provide, the smarter your coaching gets.`,
    })
  }

  return insights
}

const TYPE_STYLES = {
  success: { border: 'border-accent-green/30', bg: 'bg-accent-green/[0.06]', dot: '#10B981' },
  warning: { border: 'border-accent-amber/30', bg: 'bg-accent-amber/[0.06]', dot: '#F59E0B' },
  care: { border: 'border-accent-pink/30', bg: 'bg-accent-pink/[0.06]', dot: '#EC4899' },
  tip: { border: 'border-accent-blue/30', bg: 'bg-accent-blue/[0.06]', dot: '#3B82F6' },
  motivation: { border: 'border-accent-purple/30', bg: 'bg-accent-purple/[0.06]', dot: '#7C3AED' },
}

export default function AICoach() {
  const state = useStore()
  const [insights, setInsights] = useState(() => generateInsights(state))
  const [isTyping, setIsTyping] = useState(false)
  const [chat, setChat] = useState([
    { role: 'ai', text: `Hey ${state.user.name}! 👋 I'm your AI Life Coach. I've analyzed your data and have ${generateInsights(state).length} personalized insights for you. What would you like to explore?` }
  ])
  const [input, setInput] = useState('')

  const refreshInsights = () => {
    setIsTyping(true)
    setTimeout(() => {
      setInsights(generateInsights(state))
      setIsTyping(false)
    }, 800)
  }

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg = input
    setChat(c => [...c, { role: 'user', text: userMsg }])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const responses = [
        `Based on your data, I see you're working on building consistency. Focus on habit stacking — attach new habits to existing routines.`,
        `Your ${state.user.streak}-day streak is impressive! The key to maintaining it is preparing for tomorrow today.`,
        `Looking at your mood trends, you tend to feel better on days when you complete more habits. That's a powerful insight.`,
        `Your health score could improve with more consistent sleep. Try setting a fixed sleep and wake time.`,
        `To level up faster, focus on completing high-XP habits like workouts and meditation consistently.`,
        `Your financial data shows you're tracking well. Consider increasing your savings by automating transfers on salary day.`,
        `Remember: small daily improvements lead to stunning long-term results. You're on the right path.`,
      ]
      const response = responses[Math.floor(Math.random() * responses.length)]
      setChat(c => [...c, { role: 'ai', text: response }])
      setIsTyping(false)
    }, 1200)
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white mb-1 flex items-center gap-3">
            <BrainCircuit className="text-accent-purple-light" size={24} />
            AI Life Coach
          </h1>
          <p className="text-white/40 text-sm">Personalized insights powered by your data.</p>
        </div>
        <button onClick={refreshInsights} className="btn-ghost flex items-center gap-2">
          <RefreshCw size={14} className={isTyping ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Insights Grid */}
      <div>
        <div className="section-title mb-3">Today's Insights</div>
        <div className="space-y-3">
          {insights.map((insight, i) => {
            const styles = TYPE_STYLES[insight.type] || TYPE_STYLES.tip
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-4 rounded-2xl border ${styles.border} ${styles.bg} flex gap-4`}
              >
                <div className="text-2xl flex-shrink-0 mt-0.5">{insight.icon}</div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white mb-1">{insight.title}</div>
                  <div className="text-xs text-white/60 leading-relaxed">{insight.message}</div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
          <span className="text-xs text-white/40 font-mono">AI Coach — Online</span>
        </div>

        <div className="p-4 space-y-3 min-h-[200px] max-h-[300px] overflow-y-auto">
          {chat.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-accent-purple/30 text-white border border-accent-purple/30'
                  : 'bg-white/[0.06] text-white/80 border border-white/[0.06]'}`}>
                {msg.text}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex gap-1 px-4 py-2.5 w-16 bg-white/[0.06] rounded-2xl">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-1.5 h-1.5 bg-white/40 rounded-full"
                  animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }} />
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 p-4 border-t border-white/[0.06]">
          <input
            className="input-field flex-1"
            placeholder="Ask your coach anything..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} className="btn-primary px-4">
            <Send size={14} />
          </button>
        </div>
      </div>

      {/* Quick Prompts */}
      <div>
        <div className="section-title mb-3">Quick Prompts</div>
        <div className="flex flex-wrap gap-2">
          {[
            'How can I improve my habits?',
            'Analyze my mood patterns',
            'Help me save more money',
            'What should I focus on?',
            'How do I level up faster?',
          ].map(prompt => (
            <button key={prompt} onClick={() => { setInput(prompt); }}
              className="text-xs px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/60 hover:text-white transition-all">
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
