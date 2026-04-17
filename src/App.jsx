import { Routes, Route, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import ToastSystem from './components/ToastSystem';
import AICoach from './components/AICoach';
import Onboarding from './components/Onboarding';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import Goals from './pages/Goals';
import MoodTracker from './pages/MoodTracker';
import Health from './pages/Health';
import Finance from './pages/Finance';
import Journal from './pages/Journal';
import Analytics from './pages/Analytics';
import Achievements from './pages/Achievements';
import Profile from './pages/Profile';
import WeeklyReport from './pages/WeeklyReport';
import Pomodoro from './pages/Pomodoro';
import Leaderboard from './pages/Leaderboard';

function LoadingScreen() {
  return (
    <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-primary)' }}>
      <div style={{ textAlign:'center' }}>
        <motion.div animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:'linear' }}
          style={{ width:48, height:48, borderRadius:'50%', border:'2px solid #7c3aed', borderTopColor:'transparent', margin:'0 auto 16px' }} />
        <div style={{ color:'var(--text-primary)', fontWeight:700, fontSize:18, marginBottom:8 }}>◈ LIFE OS</div>
        <p style={{ color:'var(--text-muted)', fontSize:14 }}>Loading your dashboard...</p>
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const { firebaseUser, loading: authLoading } = useAuth();
  const { user, dataLoaded } = useApp();

  if (authLoading) return <LoadingScreen />;
  if (!firebaseUser) return <Landing />;
  if (!dataLoaded) return <LoadingScreen />;
  if (!user.onboarded) return <Onboarding />;

  return (
    <div className="flex min-h-screen" style={{ background:'var(--bg-primary)', color:'var(--text-primary)' }}>
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage:'radial-gradient(circle at 20% 20%, rgba(139,92,246,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(6,182,212,0.04) 0%, transparent 50%)' }} />
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-h-screen pt-16 lg:pt-0" style={{ minWidth:0 }}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/mood" element={<MoodTracker />} />
          <Route path="/health" element={<Health />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/weekly" element={<WeeklyReport />} />
          <Route path="/pomodoro" element={<Pomodoro />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      <BottomNav />
      <ToastSystem />
      <AICoach />
    </div>
  );
}