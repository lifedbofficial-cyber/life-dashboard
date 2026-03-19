import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard, Flame, Target, Smile, Heart,
  DollarSign, BookOpen, BarChart2, Moon, Sun, Trophy, X, Menu, User
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/habits', icon: Flame, label: 'Habits' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/mood', icon: Smile, label: 'Mood' },
  { to: '/health', icon: Heart, label: 'Health' },
  { to: '/finance', icon: DollarSign, label: 'Finance' },
  { to: '/journal', icon: BookOpen, label: 'Journal' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/achievements', icon: Trophy, label: 'Achievements' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar() {
  const { user, levelData, theme, toggleTheme } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full p-4 gap-2">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 py-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-lg font-bold shadow-glow-sm">
          ◈
        </div>
        <div>
          <div className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>LIFE OS</div>
          <div className="text-xs text-muted">Level Up Daily</div>
        </div>
      </div>

      {/* User Card */}
      <NavLink to="/profile" className="glass-card p-3 mb-2 block hover:border-purple-500/30 transition-all no-underline">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center text-xl flex-shrink-0">
            {user.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</div>
            <div className="text-xs text-muted">Lv.{levelData.level} · {levelData.title}</div>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1.5 text-muted">
            <span>{levelData.xpInLevel} XP</span>
            <span>{levelData.xpForLevel} XP</span>
          </div>
          <div className="xp-bar">
            <motion.div className="xp-bar-fill" initial={{ width: 0 }} animate={{ width: `${levelData.progress}%` }}
              transition={{ duration: 1, delay: 0.3 }} />
          </div>
        </div>
      </NavLink>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}>
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 text-xs text-muted">
          <Flame size={14} className="text-amber-400" />
          <span>{user.streak} day streak</span>
        </div>
        <button onClick={toggleTheme}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          {theme === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-purple-400" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        <Menu size={18} style={{ color: 'var(--text-primary)' }} />
      </button>

      <aside className="hidden lg:flex flex-col w-60 h-screen sticky top-0 border-r flex-shrink-0"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 border-r lg:hidden"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <button onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--bg-card)' }}>
                <X size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}