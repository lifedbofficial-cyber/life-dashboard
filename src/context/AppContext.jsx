import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { getLevelProgress } from '../utils/xpSystem';
import { ACHIEVEMENTS } from '../utils/achievements';
import { saveUserData, loadUserData } from '../utils/firebase';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

const AppContext = createContext(null);

const DEFAULT_USER = {
  name: 'Adventurer',
  avatar: '🧙',
  totalXP: 0,
  streak: 0,
  lastActiveDate: null,
  unlockedAchievements: [],
  habitsCompleted: 0,
  goalsCompleted: 0,
  journalEntries: 0,
  moodLogs: 0,
  healthLogs: 0,
  savingsMonths: 0,
  onboarded: false,
};

const DEFAULT_HABITS = [
  { id: '1', name: 'Morning Meditation', category: 'spiritual', xp: 10, icon: '🧘', completedDates: [], streak: 0 },
  { id: '2', name: 'Workout', category: 'health', xp: 15, icon: '💪', completedDates: [], streak: 0 },
  { id: '3', name: 'Read 30 min', category: 'learning', xp: 12, icon: '📚', completedDates: [], streak: 0 },
  { id: '4', name: 'Drink 2L Water', category: 'health', xp: 8, icon: '💧', completedDates: [], streak: 0 },
];

const DEFAULT_GOALS = [
  { id: '1', title: 'Run a 5K', category: 'health', progress: 0, target: 100, unit: '%', deadline: '2025-12-31', milestones: [], xp: 100 },
  { id: '2', title: 'Save 50000', category: 'finance', progress: 0, target: 50000, unit: 'INR', deadline: '2025-12-31', milestones: [], xp: 150 },
];

const DEFAULT_BUDGETS = {
  Food: 5000, Transport: 2000, Entertainment: 3000,
  Shopping: 4000, Health: 2000, Bills: 5000, Education: 3000, Other: 2000,
};

function fireLevelUpConfetti() {
  const duration = 3000;
  const end = Date.now() + duration;
  const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];
  const frame = () => {
    confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors });
    confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

export function AppProvider({ children }) {
  const { firebaseUser } = useAuth();
  const uid = firebaseUser?.uid;

  const [user, setUser] = useState(DEFAULT_USER);
  const [habits, setHabits] = useState(DEFAULT_HABITS);
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [moods, setMoods] = useState([]);
  const [health, setHealth] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [journal, setJournal] = useState([]);
  const [theme, setTheme] = useState('dark');
  const [budgets, setBudgets] = useState(DEFAULT_BUDGETS);
  const [toast, setToast] = useState(null);
  const [newAchievement, setNewAchievement] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!uid) return;
    setDataLoaded(false);
    loadUserData(uid).then((data) => {
      if (data) {
        if (data.user) setUser(u => ({ ...DEFAULT_USER, ...data.user }));
        if (data.habits) setHabits(data.habits);
        if (data.goals) setGoals(data.goals);
        if (data.moods) setMoods(data.moods);
        if (data.health) setHealth(data.health);
        if (data.transactions) setTransactions(data.transactions);
        if (data.journal) setJournal(data.journal);
        if (data.theme) setTheme(data.theme);
        if (data.budgets) setBudgets(data.budgets);
      } else {
        setUser({ ...DEFAULT_USER, name: firebaseUser.displayName || 'Adventurer', onboarded: false });
      }
      setDataLoaded(true);
    });
  }, [uid]);

  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); }, [theme]);

  const debouncedSave = useRef(debounce((uid, key, data) => { if (uid) saveUserData(uid, key, data); }, 800)).current;

  useEffect(() => { if (uid && dataLoaded) debouncedSave(uid, 'user', user); }, [user, uid, dataLoaded]);
  useEffect(() => { if (uid && dataLoaded) debouncedSave(uid, 'habits', habits); }, [habits, uid, dataLoaded]);
  useEffect(() => { if (uid && dataLoaded) debouncedSave(uid, 'goals', goals); }, [goals, uid, dataLoaded]);
  useEffect(() => { if (uid && dataLoaded) debouncedSave(uid, 'moods', moods); }, [moods, uid, dataLoaded]);
  useEffect(() => { if (uid && dataLoaded) debouncedSave(uid, 'health', health); }, [health, uid, dataLoaded]);
  useEffect(() => { if (uid && dataLoaded) debouncedSave(uid, 'transactions', transactions); }, [transactions, uid, dataLoaded]);
  useEffect(() => { if (uid && dataLoaded) debouncedSave(uid, 'journal', journal); }, [journal, uid, dataLoaded]);
  useEffect(() => { if (uid && dataLoaded) debouncedSave(uid, 'theme', theme); }, [theme, uid, dataLoaded]);
  useEffect(() => { if (uid && dataLoaded) debouncedSave(uid, 'budgets', budgets); }, [budgets, uid, dataLoaded]);

  useEffect(() => {
    if (!dataLoaded) return;
    const today = new Date().toDateString();
    const last = user.lastActiveDate;
    if (last && last !== today) {
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      if (last !== yesterday.toDateString()) setUser(u => ({ ...u, streak: 0 }));
    }
    if (!last || last !== today) setUser(u => ({ ...u, lastActiveDate: today }));
  }, [dataLoaded]);

  const addXP = useCallback((amount, reason = '') => {
    setUser(prev => {
      const newXP = prev.totalXP + amount;
      const oldLevel = getLevelProgress(prev.totalXP).level;
      const newLevel = getLevelProgress(newXP).level;
      if (newLevel > oldLevel) {
        setTimeout(() => { fireLevelUpConfetti(); setToast({ type: 'levelup', message: `Level ${newLevel}!`, xp: amount }); setTimeout(() => setToast(null), 4000); }, 100);
      } else if (reason) { setToast({ type: 'xp', message: reason, xp: amount }); setTimeout(() => setToast(null), 3000); }
      return { ...prev, totalXP: newXP };
    });
  }, []);

  const checkAchievements = useCallback((userData) => {
    const stats = { level: getLevelProgress(userData.totalXP).level, streak: userData.streak, habitsCompleted: userData.habitsCompleted, goalsCompleted: userData.goalsCompleted, journalEntries: userData.journalEntries, moodLogs: userData.moodLogs, healthLogs: userData.healthLogs, savingsMonths: userData.savingsMonths };
    ACHIEVEMENTS.forEach(ach => {
      if (!userData.unlockedAchievements?.includes(ach.id) && ach.check(stats)) {
        setUser(u => ({ ...u, unlockedAchievements: [...(u.unlockedAchievements || []), ach.id] }));
        setTimeout(() => { setNewAchievement(ach); setTimeout(() => setNewAchievement(null), 4500); }, 500);
      }
    });
  }, []);

  const completeHabit = useCallback((habitId) => {
    const today = new Date().toDateString();
    setHabits(prev => prev.map(h => {
      if (h.id !== habitId || h.completedDates?.includes(today)) return h;
      const newDates = [...(h.completedDates || []), today];
      addXP(h.xp || 10, `+${h.xp || 10} XP — ${h.name} complete!`);
      setUser(u => { const updated = { ...u, habitsCompleted: u.habitsCompleted + 1, streak: Math.max((u.streak || 0) + 0, 1) }; setTimeout(() => checkAchievements(updated), 200); return updated; });
      return { ...h, completedDates: newDates };
    }));
  }, [addXP, checkAchievements]);

  const addHabit = useCallback((habit) => setHabits(prev => [...prev, { ...habit, id: Date.now().toString(), completedDates: [], streak: 0 }]), []);
  const deleteHabit = useCallback((id) => setHabits(prev => prev.filter(h => h.id !== id)), []);
  const reorderHabits = useCallback((newOrder) => setHabits(newOrder), []);
  const addGoal = useCallback((goal) => setGoals(prev => [...prev, { ...goal, id: Date.now().toString(), milestones: goal.milestones || [] }]), []);

  const updateGoal = useCallback((id, updates) => {
    setGoals(prev => {
      const goal = prev.find(g => g.id === id);
      if (!goal) return prev;
      const updated = { ...goal, ...updates };
      const isNowComplete = updates.progress !== undefined && updates.progress >= goal.target && !goal.completed;
      if (isNowComplete) { setTimeout(() => { addXP(goal.xp || 100, `Goal "${goal.title}" completed!`); setUser(u => ({ ...u, goalsCompleted: u.goalsCompleted + 1 })); }, 0); return prev.map(g => g.id === id ? { ...updated, completed: true } : g); }
      return prev.map(g => g.id === id ? updated : g);
    });
  }, [addXP]);

  const deleteGoal = useCallback((id) => setGoals(prev => prev.filter(g => g.id !== id)), []);

  const logMood = useCallback((mood) => {
    const today = new Date().toDateString();
    const exists = moods.find(m => m.date === today);
    if (!exists) { setMoods(prev => [...prev, { date: today, mood, timestamp: Date.now() }]); addXP(5, '+5 XP — Mood logged!'); setUser(u => ({ ...u, moodLogs: u.moodLogs + 1 })); }
    else setMoods(prev => prev.map(m => m.date === today ? { ...m, mood } : m));
  }, [moods, addXP]);

  const logHealth = useCallback((data) => {
    const today = new Date().toDateString();
    setHealth(prev => { const existing = prev[today] || {}; if (!existing.logged) { addXP(10, '+10 XP — Health logged!'); setUser(u => ({ ...u, healthLogs: u.healthLogs + 1 })); } return { ...prev, [today]: { ...existing, ...data, logged: true } }; });
  }, [addXP]);

  const addTransaction = useCallback((tx) => setTransactions(prev => [...prev, { ...tx, id: Date.now().toString(), date: new Date().toISOString() }]), []);
  const deleteTransaction = useCallback((id) => setTransactions(prev => prev.filter(t => t.id !== id)), []);
  const updateBudget = useCallback((category, amount) => setBudgets(prev => ({ ...prev, [category]: amount })), []);

  const addJournalEntry = useCallback((entry) => {
    const newEntry = { id: Date.now().toString(), ...entry, date: new Date().toISOString() };
    setJournal(prev => [newEntry, ...prev]);
    addXP(8, '+8 XP — Journal entry saved!');
    setUser(u => ({ ...u, journalEntries: u.journalEntries + 1 }));
    return newEntry.id;
  }, [addXP]);

  const updateJournalEntry = useCallback((id, updates) => setJournal(prev => prev.map(e => e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e)), []);
  const deleteJournalEntry = useCallback((id) => setJournal(prev => prev.filter(e => e.id !== id)), []);
  const toggleTheme = useCallback(() => setTheme(t => t === 'dark' ? 'light' : 'dark'), []);
  const updateUser = useCallback((updates) => setUser(u => ({ ...u, ...updates })), []);
  const completeOnboarding = useCallback((name, avatar) => setUser(u => ({ ...u, name, avatar, onboarded: true })), []);

  const exportData = useCallback(() => {
    const data = { exportedAt: new Date().toISOString(), user, habits, goals, moods, health, transactions, journal, budgets };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `life-dashboard-backup-${new Date().toLocaleDateString('en-CA')}.json`; a.click(); URL.revokeObjectURL(url);
  }, [user, habits, goals, moods, health, transactions, journal, budgets]);

  const resetAllData = useCallback(() => {
    setUser({ ...DEFAULT_USER, onboarded: false, name: firebaseUser?.displayName || 'Adventurer' });
    setHabits(DEFAULT_HABITS); setGoals(DEFAULT_GOALS); setMoods([]); setHealth({}); setTransactions([]); setJournal([]); setBudgets(DEFAULT_BUDGETS);
  }, [firebaseUser]);

  const todayHealth = health[new Date().toDateString()] || {};
  const todayMood = moods.find(m => m.date === new Date().toDateString());
  const levelData = getLevelProgress(user.totalXP);

  return (
    <AppContext.Provider value={{
      user, updateUser, levelData, completeOnboarding, dataLoaded,
      habits, completeHabit, addHabit, deleteHabit, reorderHabits,
      goals, addGoal, updateGoal, deleteGoal,
      moods, logMood, todayMood,
      health, todayHealth, logHealth,
      transactions, addTransaction, deleteTransaction,
      budgets, updateBudget,
      journal, addJournalEntry, updateJournalEntry, deleteJournalEntry,
      theme, toggleTheme, toast, setToast, newAchievement, addXP, exportData, resetAllData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}