import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Flame, DollarSign, Heart, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const BOTTOM_NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Home' },
  { to: '/habits', icon: Flame, label: 'Habits' },
  { to: '/finance', icon: DollarSign, label: 'Finance' },
  { to: '/health', icon: Heart, label: 'Health' },
  { to: '/leaderboard', icon: Users, label: 'Leaderboard' },
];

export default function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-2 pb-2 pt-1" style={{ background: 'rgba(8,8,16,0.92)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center justify-around">
        {BOTTOM_NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} className="flex-1">
            {({ isActive }) => (
              <motion.div whileTap={{ scale: 0.85 }} className="flex flex-col items-center gap-1 py-2 px-1 rounded-2xl transition-all" style={{ background: isActive ? 'rgba(139,92,246,0.15)' : 'transparent' }}>
                <Icon size={20} style={{ color: isActive ? '#a78bfa' : 'rgba(255,255,255,0.35)', strokeWidth: isActive ? 2.5 : 1.5 }} />
                <span className="text-[10px] font-medium" style={{ color: isActive ? '#a78bfa' : 'rgba(255,255,255,0.35)' }}>{label}</span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}