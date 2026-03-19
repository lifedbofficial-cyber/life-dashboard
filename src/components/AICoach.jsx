import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { X, Send, Bot, Sparkles } from 'lucide-react';

function generateResponse(q, context) {
  const lq = q.toLowerCase();
  const { habits, goals, moods, user, levelData } = context;
  const today = new Date().toDateString();
  const done = habits.filter(h => h.completedDates?.includes(today)).length;
  const total = habits.length;

  if (lq.includes('streak')) {
    return user.streak > 0
      ? `🔥 Your ${user.streak}-day streak is going strong! Complete at least one habit today to keep it alive.`
      : `🌱 Start a streak today! Complete even one habit to begin your new streak.`;
  }
  if (lq.includes('focus') || lq.includes('today')) {
    const incomplete = habits.filter(h => !h.completedDates?.includes(today));
    return incomplete.length > 0
      ? `Today, focus on: ${incomplete.slice(0, 3).map(h => h.name).join(', ')}. Start with the easiest one to build momentum! 💪`
      : `🎉 You've crushed all your habits today! Consider working on your goals or journaling.`;
  }
  if (lq.includes('motivat') || lq.includes('boost')) {
    return `⚡ You're Level ${levelData.level} — ${user.totalXP} XP earned through real discipline. Every single habit is rewiring your brain. You're ${Math.round(levelData.progress)}% to Level ${levelData.level + 1}!`;
  }
  if (lq.includes('goal')) {
    const active = goals.filter(g => !g.completed);
    return active.length > 0
      ? `You have ${active.length} active goal${active.length > 1 ? 's' : ''}. "${active[0].title}" is ${Math.round((active[0].progress / active[0].target) * 100)}% complete. Break it into daily steps!`
      : `No active goals. Head to Goals and set one — goals give your habits real purpose. 🎯`;
  }
  if (lq.includes('mood') || lq.includes('feel')) {
    const todayMood = moods.find(m => m.date === today);
    return todayMood
      ? `Your mood today is "${todayMood.mood}". ${todayMood.mood === 'happy' || todayMood.mood === 'good' ? 'Ride that energy!' : 'Be gentle with yourself. Small wins still count.'}`
      : `You haven't logged your mood today. Checking in with yourself is powerful — try it in the Mood section! 💜`;
  }
  // Default
  const rate = total > 0 ? Math.round((done / total) * 100) : 0;
  if (rate === 100 && total > 0) return `🏆 Perfect day! You completed all ${total} habits. You're on a ${user.streak}-day streak. Incredible consistency!`;
  if (rate >= 50) return `✅ ${done}/${total} habits done today (${rate}%). ${total - done} more to go — you're more than halfway!`;
  return `💡 ${done}/${total} habits done today. Try completing your shortest habit next — momentum compounds fast!`;
}

const QUICK_QUESTIONS = [
  "How am I doing?",
  "What should I focus on?",
  "Give me motivation",
  "Check my goals",
];

export default function AICoach() {
  const context = useApp();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Hey ${context.user.name}! 👋 I'm your AI Life Coach. Ask me anything about your progress!` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: generateResponse(msg, context) }]);
      setLoading(false);
    }, 700 + Math.random() * 500);
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', boxShadow: '0 8px 32px rgba(124,58,237,0.5)' }}
      >
        {open ? <X size={20} className="text-white" /> : <Sparkles size={22} className="text-white" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-3xl overflow-hidden"
            style={{ background: 'rgba(8,8,16,0.97)', border: '1px solid rgba(139,92,246,0.25)', backdropFilter: 'blur(40px)', boxShadow: '0 24px 80px rgba(0,0,0,0.7)' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.3))', border: '1px solid rgba(139,92,246,0.3)' }}>
                <Bot size={18} className="text-purple-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">AI Life Coach</div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: 'pulse 2s infinite' }} />
                  <span className="text-xs text-emerald-400">Online</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="h-64 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed text-white"
                    style={{
                      background: msg.role === 'user' ? 'linear-gradient(135deg, #7c3aed, #5b21b6)' : 'rgba(255,255,255,0.07)',
                      borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      border: msg.role === 'ai' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-400"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick Questions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {QUICK_QUESTIONS.map(q => (
                  <button key={q} onClick={() => send(q)}
                    className="text-xs px-3 py-1.5 rounded-full border transition-all hover:border-purple-500/50 hover:bg-purple-500/10"
                    style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 pb-4 pt-2 flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Ask your coach..."
                className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none text-white"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <button onClick={() => send()}
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}>
                <Send size={16} className="text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
