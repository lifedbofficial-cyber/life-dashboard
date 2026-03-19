import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ToastSystem from './components/ToastSystem';
import AICoach from './components/AICoach';
import Onboarding from './components/Onboarding';
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
import { useApp } from './context/AppContext';

export default function App() {
  const location = useLocation();
  const { user } = useApp();

  // Show onboarding for new users
  if (!user.onboarded) {
    return <Onboarding />;
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(139,92,246,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(6,182,212,0.04) 0%, transparent 50%)',
      }} />
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-h-screen pt-16 lg:pt-0">
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
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      <ToastSystem />
      <AICoach />
    </div>
  );
}