# 🎮 Life Dashboard — Level Up Your Life

A gamified life operating system to track habits, goals, mood, health, finance, and journaling — like a video game character sheet for your life.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Then open http://localhost:5173

## ✨ Features

- **Dashboard** — XP bar, level, streak, all stats at a glance
- **Habit Tracker** — Add habits, complete them, earn XP + confetti
- **Goal Tracker** — Set goals with milestones and progress bars
- **Mood Tracker** — Daily check-in + 14-day trend chart
- **Health Tracker** — Water, steps, workout, sleep rings
- **Finance Tracker** — Income/expense logging + donut chart
- **Journal** — Write, search, tag daily entries
- **Analytics** — Beautiful charts across all categories
- **Achievements** — Unlock badges as you grow
- **AI Life Coach** — Floating chat panel with personalized insights

## 🎨 Tech Stack

- React 18 + Vite
- Tailwind CSS (dark/light mode)
- Framer Motion (animations)
- Chart.js + react-chartjs-2 (analytics)
- canvas-confetti (celebration effects)
- date-fns (date handling)
- LocalStorage (data persistence)

## 🗂 Structure

```
src/
├── components/   Sidebar, ToastSystem, AICoach, StatCard
├── context/      AppContext (central state + localStorage)
├── hooks/        useLocalStorage
├── pages/        Dashboard, Habits, Goals, Mood, Health, Finance, Journal, Analytics, Achievements
└── utils/        xpSystem, achievements, quotes
```
