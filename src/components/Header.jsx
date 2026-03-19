import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Sun, Moon, Bell, Edit3 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { format } from 'date-fns'

const QUOTES = [
  "The secret of getting ahead is getting started.",
  "Small daily improvements lead to stunning results.",
  "Your future is created by what you do today.",
  "Level up your life, one habit at a time.",
  "Progress, not perfection.",
  "Discipline is the bridge between goals and accomplishment.",
  "Every expert was once a beginner.",
]

export default function Header({ onMenuClick }) {
  const { theme, toggleTheme, recentAchievement } = useStore()
  const [showQuote, setShowQuote] = useState(true)

  const quote = QUOTES[new Date().getDay() % QUOTES.length]
  const dateStr = format(new Date(), 'EEEE, MMMM d')

  return (
    <header className="sticky top-0 z-30 bg-bg-primary/80 backdrop-blur-md border-b border-white/[0.06] px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Menu + Date */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] 
                       flex items-center justify-center text-white/60 hover:text-white transition-all"
          >
            <Menu size={18} />
          </button>

          <div>
            <div className="text-xs text-white/30 font-mono">{dateStr}</div>
            <div className="text-sm text-white/60 font-body hidden sm:block truncate max-w-xs">
              ✦ {quote}
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {/* Achievement pop */}
          <AnimatePresence>
            {recentAchievement && (
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl 
                           bg-accent-amber/10 border border-accent-amber/30 text-xs"
              >
                <span>{recentAchievement.icon}</span>
                <span className="text-accent-amber font-medium">{recentAchievement.title}</span>
                <span className="text-white/40">unlocked!</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] 
                       flex items-center justify-center text-white/60 hover:text-white transition-all"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Notifications bell */}
          <button className="relative w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] 
                             flex items-center justify-center text-white/60 hover:text-white transition-all">
            <Bell size={15} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent-purple rounded-full" />
          </button>
        </div>
      </div>
    </header>
  )
}
