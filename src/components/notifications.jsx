import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Bell, BellOff, X, Check } from 'lucide-react';

// ── Ask for permission and show a notification ──────────────
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  const result = await Notification.requestPermission();
  return result;
}

export function showNotification(title, body, icon = '/icon-192.png') {
  if (Notification.permission !== 'granted') return;
  const n = new Notification(title, {
    body,
    icon,
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'life-os',
  });
  n.onclick = () => { window.focus(); n.close(); };
  setTimeout(() => n.close(), 8000);
}

// ── Smart reminder logic ─────────────────────────────────────
export function useSmartReminders() {
  const { habits, moods, health, user } = useApp();

  const checkAndNotify = useCallback(() => {
    if (Notification.permission !== 'granted') return;

    const today = new Date().toDateString();
    const hour = new Date().getHours();
    const lastKey = `life-os-notified-${today}`;

    // Only notify once per day
    if (localStorage.getItem(lastKey)) return;

    const todayDone = habits.filter(h => h.completedDates?.includes(today)).length;
    const remaining = habits.length - todayDone;
    const hasMood = moods.some(m => m.date === today);
    const todayHealth = health[today] || {};

    // Evening reminder (after 7pm) for incomplete habits
    if (hour >= 19 && remaining > 0) {
      showNotification(
        `${remaining} habit${remaining > 1 ? 's' : ''} left today! 🔥`,
        `Don't break your ${user.streak}-day streak. Complete ${habits[todayDone]?.name || 'your habits'} now.`
      );
      localStorage.setItem(lastKey, 'habits');
      return;
    }

    // Morning reminder (8-10am)
    if (hour >= 8 && hour <= 10 && todayDone === 0) {
      showNotification(
        `Good morning, ${user.name}! ☀️`,
        `Start your day strong. You have ${habits.length} habits waiting. Let's go!`
      );
      localStorage.setItem(lastKey, 'morning');
      return;
    }

    // Afternoon mood check (2-3pm)
    if (hour >= 14 && hour <= 15 && !hasMood) {
      showNotification(
        'How are you feeling? 😊',
        'Log your mood to earn +5 XP and track your emotional patterns.'
      );
      localStorage.setItem(lastKey, 'mood');
      return;
    }

    // Streak protection (9pm)
    if (hour >= 21 && user.streak > 0 && remaining > 0) {
      showNotification(
        `⚠️ Streak at risk! ${user.streak} days on the line`,
        `Complete at least one habit before midnight to protect your streak!`
      );
      localStorage.setItem(lastKey, 'streak');
    }
  }, [habits, moods, health, user]);

  // Check every 30 minutes while app is open
  useEffect(() => {
    checkAndNotify();
    const interval = setInterval(checkAndNotify, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkAndNotify]);
}

// ── Permission Banner (shown on first visit) ─────────────────
export function NotificationBanner() {
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | requesting | granted | denied

  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default' && !localStorage.getItem('life-os-notif-asked')) {
      // Show after 30 seconds so user can explore first
      const t = setTimeout(() => setShow(true), 30000);
      return () => clearTimeout(t);
    }
  }, []);

  const handleAllow = async () => {
    setStatus('requesting');
    const result = await requestNotificationPermission();
    localStorage.setItem('life-os-notif-asked', 'true');
    setStatus(result);
    setTimeout(() => setShow(false), 2000);

    if (result === 'granted') {
      setTimeout(() => {
        showNotification('🎉 Notifications enabled!', 'You\'ll get smart reminders to complete your habits and protect your streak.');
      }, 500);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('life-os-notif-asked', 'true');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          className="fixed bottom-24 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 lg:w-96 z-50 rounded-2xl p-4 flex items-start gap-3"
          style={{ background: 'rgba(12,10,24,0.98)', border: '1px solid rgba(139,92,246,0.35)', boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}>

          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
            <Bell size={18} className="text-purple-400" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>
              Enable reminders?
            </div>
            <div className="text-xs text-muted mb-3 leading-relaxed">
              Get smart nudges when you're about to break your streak or forget to log habits.
            </div>

            {status === 'granted' ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <Check size={13} /> Enabled! You're all set.
              </div>
            ) : status === 'denied' ? (
              <div className="text-xs text-muted">No worries — you can enable in browser settings later.</div>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleAllow} disabled={status === 'requesting'}
                  className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
                  <Bell size={12} />
                  {status === 'requesting' ? 'Enabling...' : 'Enable'}
                </button>
                <button onClick={handleDismiss} className="btn-secondary text-xs px-4 py-2">
                  Not now
                </button>
              </div>
            )}
          </div>

          <button onClick={handleDismiss} className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all">
            <X size={12} style={{ color: 'var(--text-muted)' }} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Notification Settings (used in Profile page) ─────────────
export function NotificationSettings() {
  const [permission, setPermission] = useState(
    'Notification' in window ? Notification.permission : 'unsupported'
  );

  const enable = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === 'granted') {
      showNotification('✅ Reminders enabled!', 'Life OS will now remind you to complete habits and protect your streak.');
    }
  };

  const testNotification = () => {
    showNotification('🔥 Test reminder!', 'This is what your daily habit reminders will look like.');
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)' }}>
          <Bell size={16} className="text-purple-400" />
        </div>
        <div>
          <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Push Notifications</div>
          <div className="text-xs text-muted">Smart reminders for habits and streaks</div>
        </div>
        <div className="ml-auto">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            permission === 'granted'
              ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20'
              : permission === 'denied'
              ? 'text-rose-400 bg-rose-400/10 border border-rose-400/20'
              : 'text-amber-400 bg-amber-400/10 border border-amber-400/20'
          }`}>
            {permission === 'granted' ? '✓ Enabled' : permission === 'denied' ? '✗ Blocked' : permission === 'unsupported' ? 'Not supported' : 'Not set'}
          </span>
        </div>
      </div>

      {permission === 'granted' ? (
        <div>
          <div className="text-xs text-muted mb-3">You'll receive reminders at:</div>
          <div className="flex flex-col gap-2 mb-4">
            {[
              { time: '8–10 AM', desc: 'Morning motivation to start habits' },
              { time: '2–3 PM', desc: 'Afternoon mood check-in' },
              { time: '7 PM', desc: 'Evening habit reminder if incomplete' },
              { time: '9 PM', desc: 'Streak protection alert' },
            ].map(r => (
              <div key={r.time} className="flex items-center gap-3 text-xs">
                <div className="font-mono font-bold w-16 text-purple-400">{r.time}</div>
                <div className="text-muted">{r.desc}</div>
              </div>
            ))}
          </div>
          <button onClick={testNotification} className="btn-secondary text-xs px-4 py-2">
            Send test notification
          </button>
        </div>
      ) : permission === 'denied' ? (
        <div className="text-xs text-muted p-3 rounded-xl" style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)' }}>
          Notifications are blocked. To enable: click the 🔒 lock icon in your browser's address bar → Notifications → Allow.
        </div>
      ) : permission === 'unsupported' ? (
        <div className="text-xs text-muted">Your browser doesn't support notifications. Try Chrome or Edge.</div>
      ) : (
        <button onClick={enable} className="btn-primary text-sm px-4 py-2.5 flex items-center gap-2">
          <Bell size={14} /> Enable Reminders
        </button>
      )}
    </div>
  );
}