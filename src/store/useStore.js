import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── XP & Level Config ────────────────────────────────────────────────────────
const XP_PER_LEVEL = (level) => Math.floor(100 * Math.pow(1.5, level - 1))

const calcLevel = (totalXP) => {
  let level = 1
  let remaining = totalXP
  while (true) {
    const needed = XP_PER_LEVEL(level)
    if (remaining < needed) break
    remaining -= needed
    level++
  }
  return { level, xp: remaining, xpToNext: XP_PER_LEVEL(level) }
}

// ─── Achievements Config ───────────────────────────────────────────────────────
const ACHIEVEMENTS_CONFIG = [
  { id: 'first_habit', title: 'First Step', desc: 'Complete your first habit', icon: '🌱', xp: 50 },
  { id: 'streak_7', title: 'Week Warrior', desc: '7-day streak achieved', icon: '🔥', xp: 100 },
  { id: 'streak_30', title: 'Iron Will', desc: '30-day streak achieved', icon: '⚡', xp: 500 },
  { id: 'habits_10', title: 'Habit Builder', desc: 'Complete 10 habits total', icon: '💪', xp: 75 },
  { id: 'habits_100', title: 'Century Club', desc: '100 habits completed', icon: '🏆', xp: 250 },
  { id: 'first_goal', title: 'Goal Setter', desc: 'Create your first goal', icon: '🎯', xp: 30 },
  { id: 'goal_complete', title: 'Mission Complete', desc: 'Complete a goal', icon: '✅', xp: 200 },
  { id: 'level_5', title: 'Rising Star', desc: 'Reach Level 5', icon: '⭐', xp: 150 },
  { id: 'level_10', title: 'Veteran', desc: 'Reach Level 10', icon: '👑', xp: 300 },
  { id: 'journal_7', title: 'Storyteller', desc: 'Write 7 journal entries', icon: '📖', xp: 100 },
  { id: 'savings_first', title: 'Saver', desc: 'Log your first savings', icon: '💰', xp: 50 },
  { id: 'mood_week', title: 'Self-Aware', desc: 'Track mood for 7 days', icon: '🧘', xp: 80 },
]

const DEFAULT_HABITS = [
  { id: 'h1', name: 'Morning Meditation', category: 'Spiritual', xpReward: 10, icon: '🧘', completedDates: [], streak: 0 },
  { id: 'h2', name: 'Workout', category: 'Health', xpReward: 15, icon: '💪', completedDates: [], streak: 0 },
  { id: 'h3', name: 'Read 30 Minutes', category: 'Learning', xpReward: 12, icon: '📚', completedDates: [], streak: 0 },
  { id: 'h4', name: 'Drink 2L Water', category: 'Health', xpReward: 8, icon: '💧', completedDates: [], streak: 0 },
  { id: 'h5', name: 'No Social Media', category: 'Mind', xpReward: 20, icon: '🧠', completedDates: [], streak: 0 },
]

const today = () => new Date().toISOString().split('T')[0]

// ─── Store ─────────────────────────────────────────────────────────────────────
export const useStore = create(
  persist(
    (set, get) => ({
      // ── User ────────────────────────────────────────────────────────────────
      user: {
        name: 'Player One',
        avatar: '🧑‍💻',
        totalXP: 430,
        streak: 8,
        lastActiveDate: today(),
        title: 'Novice Optimizer',
      },

      // ── Computed Level ───────────────────────────────────────────────────────
      getLevelData: () => {
        const { totalXP } = get().user
        return calcLevel(totalXP)
      },

      // ── Habits ──────────────────────────────────────────────────────────────
      habits: DEFAULT_HABITS,

      addHabit: (habit) => set((s) => ({
        habits: [...s.habits, {
          id: `h${Date.now()}`,
          name: habit.name,
          category: habit.category,
          xpReward: habit.xpReward || 10,
          icon: habit.icon || '⚡',
          completedDates: [],
          streak: 0,
        }]
      })),

      removeHabit: (id) => set((s) => ({ habits: s.habits.filter(h => h.id !== id) })),

      completeHabit: (id) => {
        const state = get()
        const habit = state.habits.find(h => h.id === id)
        if (!habit) return

        const todayStr = today()
        if (habit.completedDates.includes(todayStr)) return // already done

        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]
        const newStreak = habit.completedDates.includes(yesterdayStr) ? habit.streak + 1 : 1

        const updatedHabits = state.habits.map(h =>
          h.id === id
            ? { ...h, completedDates: [...h.completedDates, todayStr], streak: newStreak }
            : h
        )

        // XP gain
        const newTotalXP = state.user.totalXP + habit.xpReward
        const newStreak = Math.max(state.user.streak, newStreak)

        // Check achievements
        const completedToday = updatedHabits.filter(h => h.completedDates.includes(todayStr)).length
        const totalCompleted = updatedHabits.reduce((sum, h) => sum + h.completedDates.length, 0)

        set({
          habits: updatedHabits,
          user: { ...state.user, totalXP: newTotalXP },
        })

        // Achievement checks
        if (totalCompleted === 1) get().unlockAchievement('first_habit')
        if (totalCompleted >= 10) get().unlockAchievement('habits_10')
        if (totalCompleted >= 100) get().unlockAchievement('habits_100')

        const { level } = calcLevel(newTotalXP)
        if (level >= 5) get().unlockAchievement('level_5')
        if (level >= 10) get().unlockAchievement('level_10')

        return habit.xpReward
      },

      // ── Goals ───────────────────────────────────────────────────────────────
      goals: [
        {
          id: 'g1',
          title: 'Run a Marathon',
          category: 'Health',
          progress: 35,
          target: 100,
          deadline: '2024-12-31',
          icon: '🏃',
          milestones: [
            { id: 'm1', label: '5K completed', done: true, xp: 50 },
            { id: 'm2', label: '10K completed', done: false, xp: 75 },
            { id: 'm3', label: 'Half Marathon', done: false, xp: 150 },
            { id: 'm4', label: 'Full Marathon', done: false, xp: 300 },
          ]
        },
        {
          id: 'g2',
          title: 'Save ₹1,00,000',
          category: 'Finance',
          progress: 45000,
          target: 100000,
          deadline: '2024-12-31',
          icon: '💰',
          milestones: [
            { id: 'm5', label: '₹25,000 saved', done: true, xp: 50 },
            { id: 'm6', label: '₹50,000 saved', done: false, xp: 100 },
            { id: 'm7', label: '₹1,00,000 saved', done: false, xp: 200 },
          ]
        },
      ],

      addGoal: (goal) => {
        set((s) => ({
          goals: [...s.goals, {
            id: `g${Date.now()}`,
            title: goal.title,
            category: goal.category || 'Personal',
            progress: 0,
            target: goal.target || 100,
            deadline: goal.deadline,
            icon: goal.icon || '🎯',
            milestones: [],
          }]
        }))
        get().unlockAchievement('first_goal')
      },

      updateGoalProgress: (id, progress) => set((s) => ({
        goals: s.goals.map(g => {
          if (g.id !== id) return g
          const updated = { ...g, progress: Math.min(progress, g.target) }
          if (updated.progress >= updated.target) {
            setTimeout(() => get().unlockAchievement('goal_complete'), 0)
          }
          return updated
        })
      })),

      toggleMilestone: (goalId, milestoneId) => {
        const state = get()
        const goal = state.goals.find(g => g.id === goalId)
        const milestone = goal?.milestones.find(m => m.id === milestoneId)
        if (!milestone || milestone.done) return

        set({
          goals: state.goals.map(g =>
            g.id === goalId
              ? { ...g, milestones: g.milestones.map(m => m.id === milestoneId ? { ...m, done: true } : m) }
              : g
          ),
          user: { ...state.user, totalXP: state.user.totalXP + (milestone.xp || 50) }
        })
      },

      removeGoal: (id) => set((s) => ({ goals: s.goals.filter(g => g.id !== id) })),

      // ── Moods ───────────────────────────────────────────────────────────────
      moods: [],

      logMood: (mood, note = '') => {
        const todayStr = today()
        set((s) => {
          const existing = s.moods.findIndex(m => m.date === todayStr)
          const newMoods = existing >= 0
            ? s.moods.map((m, i) => i === existing ? { ...m, mood, note } : m)
            : [...s.moods, { date: todayStr, mood, note }]

          // Achievement check
          const moodDates = new Set(newMoods.map(m => m.date))
          if (moodDates.size >= 7) setTimeout(() => get().unlockAchievement('mood_week'), 0)

          return { moods: newMoods }
        })
      },

      // ── Health ──────────────────────────────────────────────────────────────
      health: [],

      logHealth: (data) => {
        const todayStr = today()
        set((s) => {
          const existing = s.health.findIndex(h => h.date === todayStr)
          const entry = { date: todayStr, water: 0, steps: 0, workout: 0, sleep: 0, ...data }
          const newHealth = existing >= 0
            ? s.health.map((h, i) => i === existing ? { ...h, ...data } : h)
            : [...s.health, entry]
          return { health: newHealth }
        })
      },

      getTodayHealth: () => {
        const todayStr = today()
        return get().health.find(h => h.date === todayStr) || { water: 0, steps: 0, workout: 0, sleep: 0 }
      },

      // ── Finance ─────────────────────────────────────────────────────────────
      transactions: [
        { id: 't1', type: 'income', amount: 75000, category: 'Salary', date: '2024-01-01', note: 'Monthly salary' },
        { id: 't2', type: 'expense', amount: 12000, category: 'Rent', date: '2024-01-02', note: 'Apartment rent' },
        { id: 't3', type: 'expense', amount: 3500, category: 'Food', date: '2024-01-05', note: 'Groceries & eating out' },
        { id: 't4', type: 'savings', amount: 10000, category: 'Emergency Fund', date: '2024-01-06', note: 'Monthly savings' },
        { id: 't5', type: 'expense', amount: 2000, category: 'Entertainment', date: '2024-01-10', note: 'Netflix, movies' },
        { id: 't6', type: 'expense', amount: 1500, category: 'Transport', date: '2024-01-12', note: 'Fuel & cab' },
      ],

      addTransaction: (tx) => {
        set((s) => ({
          transactions: [...s.transactions, { id: `t${Date.now()}`, date: today(), ...tx }]
        }))
        if (tx.type === 'savings') {
          get().unlockAchievement('savings_first')
          set((s) => ({ user: { ...s.user, totalXP: s.user.totalXP + 20 } }))
        }
      },

      removeTransaction: (id) => set((s) => ({ transactions: s.transactions.filter(t => t.id !== id) })),

      // ── Journal ─────────────────────────────────────────────────────────────
      journal: [],

      addJournalEntry: (entry) => {
        const todayStr = today()
        set((s) => {
          const existing = s.journal.findIndex(j => j.date === todayStr && !entry.id)
          const newEntry = {
            id: entry.id || `j${Date.now()}`,
            date: todayStr,
            title: entry.title || 'Untitled Entry',
            content: entry.content || '',
            mood: entry.mood || null,
          }
          const newJournal = existing >= 0
            ? s.journal.map((j, i) => i === existing ? { ...j, ...newEntry } : j)
            : [...s.journal, newEntry]

          if (newJournal.length >= 7) setTimeout(() => get().unlockAchievement('journal_7'), 0)
          return { journal: newJournal }
        })
        set((s) => ({ user: { ...s.user, totalXP: s.user.totalXP + 5 } }))
      },

      updateJournalEntry: (id, data) => set((s) => ({
        journal: s.journal.map(j => j.id === id ? { ...j, ...data } : j)
      })),

      deleteJournalEntry: (id) => set((s) => ({ journal: s.journal.filter(j => j.id !== id) })),

      // ── Achievements ────────────────────────────────────────────────────────
      achievements: ACHIEVEMENTS_CONFIG.map(a => ({ ...a, unlocked: false, unlockedAt: null })),
      recentAchievement: null,

      unlockAchievement: (id) => {
        const state = get()
        const ach = state.achievements.find(a => a.id === id)
        if (!ach || ach.unlocked) return

        set({
          achievements: state.achievements.map(a =>
            a.id === id ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() } : a
          ),
          user: { ...state.user, totalXP: state.user.totalXP + ach.xp },
          recentAchievement: ach,
        })

        setTimeout(() => set({ recentAchievement: null }), 4000)
      },

      // ── Theme ────────────────────────────────────────────────────────────────
      theme: 'dark',
      toggleTheme: () => set((s) => {
        const next = s.theme === 'dark' ? 'light' : 'dark'
        document.documentElement.classList.toggle('dark', next === 'dark')
        return { theme: next }
      }),

      // ── Streak Check ────────────────────────────────────────────────────────
      checkStreak: () => {
        const state = get()
        const todayStr = today()
        if (state.user.lastActiveDate === todayStr) return

        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        const newStreak = state.user.lastActiveDate === yesterdayStr ? state.user.streak + 1 : 1

        set({ user: { ...state.user, streak: newStreak, lastActiveDate: todayStr } })

        if (newStreak >= 7) get().unlockAchievement('streak_7')
        if (newStreak >= 30) get().unlockAchievement('streak_30')
      },

      // ── Update Profile ───────────────────────────────────────────────────────
      updateUser: (data) => set((s) => ({ user: { ...s.user, ...data } })),
    }),
    {
      name: 'life-dashboard-storage',
      version: 1,
    }
  )
)
