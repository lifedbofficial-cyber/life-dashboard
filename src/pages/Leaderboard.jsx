import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../utils/firebase';
import { ref, set, get, onValue, off } from 'firebase/database';
import { Share2, Copy, Check, Trophy, Flame, Zap, UserPlus, X } from 'lucide-react';

const MEDALS = ['🥇', '🥈', '🥉'];
const RANK_COLORS = ['#fbbf24', '#94a3b8', '#f97316'];

export default function Leaderboard() {
  const { user, levelData } = useApp();
  const { firebaseUser } = useAuth();
  const [board, setBoard] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('xp'); // xp | streak | habits

  const shareCode = firebaseUser?.uid?.slice(0, 8).toUpperCase() || '';
  const shareLink = `${window.location.origin}?join=${shareCode}`;

  // Publish own data to leaderboard
  useEffect(() => {
    if (!firebaseUser?.uid) return;
    const myRef = ref(db, `leaderboard/${firebaseUser.uid}`);
    set(myRef, {
      name: user.name,
      avatar: user.avatar,
      xp: user.totalXP,
      level: levelData.level,
      streak: user.streak,
      habitsCompleted: user.habitsCompleted,
      lastSeen: Date.now(),
      uid: firebaseUser.uid,
    });
  }, [user, levelData, firebaseUser]);

  // Join via code
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode && firebaseUser?.uid) {
      // Add this user to the joiner's friends list
      const friendRef = ref(db, `friends/${joinCode.toLowerCase()}/${firebaseUser.uid}`);
      set(friendRef, true);
      const myFriendRef = ref(db, `friends/${firebaseUser.uid.slice(0, 8)}/${joinCode.toLowerCase()}`);
      set(myFriendRef, true);
    }
  }, [firebaseUser]);

  // Load leaderboard (all users who published data)
  useEffect(() => {
    const boardRef = ref(db, 'leaderboard');
    onValue(boardRef, (snap) => {
      if (snap.exists()) {
        const data = Object.values(snap.val());
        // Filter to recent users (last 7 days)
        const week = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const recent = data.filter(u => u.lastSeen > week);
        setBoard(recent);
      }
      setLoading(false);
    });
    return () => off(boardRef);
  }, []);

  const sorted = [...board].sort((a, b) => {
    if (tab === 'xp') return b.xp - a.xp;
    if (tab === 'streak') return b.streak - a.streak;
    return b.habitsCompleted - a.habitsCompleted;
  });

  const myRank = sorted.findIndex(u => u.uid === firebaseUser?.uid) + 1;

  const copy = async () => {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const share = async () => {
    if (navigator.share) {
      navigator.share({ title: 'Join me on Life OS!', text: `Challenge me on Life OS! I'm Level ${levelData.level} with ${user.totalXP} XP 💪`, url: shareLink });
    } else {
      copy();
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto pb-24 lg:pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>Leaderboard</h1>
        <p className="text-sm text-muted">Compete with friends. Top users from the past 7 days.</p>
      </motion.div>

      {/* My Rank Card */}
      {myRank > 0 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 mb-5 flex items-center gap-4"
          style={{ border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.08)' }}>
          <div className="font-display font-black text-3xl w-10 text-center"
            style={{ color: myRank <= 3 ? RANK_COLORS[myRank - 1] : 'var(--text-muted)' }}>
            {myRank <= 3 ? MEDALS[myRank - 1] : `#${myRank}`}
          </div>
          <div className="text-2xl">{user.avatar}</div>
          <div className="flex-1">
            <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>You — {user.name}</div>
            <div className="text-xs text-muted">Level {levelData.level} · {user.streak} day streak</div>
          </div>
          <div className="text-right">
            <div className="font-display font-bold text-lg" style={{ color: '#a78bfa' }}>{user.totalXP.toLocaleString()}</div>
            <div className="text-xs text-muted">XP</div>
          </div>
        </motion.div>
      )}

      {/* Invite Card */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card p-5 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <UserPlus size={16} className="text-purple-400" />
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Invite Friends</span>
        </div>
        <p className="text-xs text-muted mb-3">Share your link to challenge friends. They'll appear on the leaderboard automatically.</p>
        <div className="flex items-center gap-2 p-3 rounded-xl mb-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
          <code className="text-xs flex-1 truncate" style={{ color: 'var(--accent-light)' }}>{shareLink}</code>
          <button onClick={copy} className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all">
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} style={{ color: 'var(--text-muted)' }} />}
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={share} className="btn-primary flex-1 justify-center text-sm gap-2">
            <Share2 size={14} /> Share Link
          </button>
          <button onClick={copy} className="btn-secondary flex-1 justify-center text-sm">
            {copied ? '✓ Copied!' : 'Copy Link'}
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { id: 'xp', label: '⭐ XP' },
          { id: 'streak', label: '🔥 Streak' },
          { id: 'habits', label: '💪 Habits' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'btn-primary' : 'btn-secondary'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Leaderboard List */}
      <div className="flex flex-col gap-2">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
          ))
        ) : sorted.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🏆</div>
            <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No one here yet!</div>
            <p className="text-sm text-muted">Invite friends to start competing</p>
          </div>
        ) : (
          sorted.slice(0, 20).map((entry, i) => {
            const isMe = entry.uid === firebaseUser?.uid;
            const value = tab === 'xp' ? entry.xp?.toLocaleString() : tab === 'streak' ? `${entry.streak}d` : entry.habitsCompleted;
            const unit = tab === 'xp' ? 'XP' : tab === 'streak' ? 'streak' : 'habits';

            return (
              <motion.div key={entry.uid}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 p-3.5 rounded-2xl transition-all"
                style={{
                  background: isMe ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isMe ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.06)'}`,
                }}>
                <div className="font-display font-black text-lg w-8 text-center"
                  style={{ color: i < 3 ? RANK_COLORS[i] : 'var(--text-muted)', fontSize: i < 3 ? 22 : 16 }}>
                  {i < 3 ? MEDALS[i] : `${i + 1}`}
                </div>
                <div className="text-2xl">{entry.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate" style={{ color: isMe ? '#a78bfa' : 'var(--text-primary)' }}>
                    {entry.name} {isMe && '(you)'}
                  </div>
                  <div className="text-xs text-muted">Level {entry.level}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-display font-bold text-base"
                    style={{ color: i < 3 ? RANK_COLORS[i] : 'var(--text-primary)' }}>
                    {value}
                  </div>
                  <div className="text-xs text-muted">{unit}</div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}