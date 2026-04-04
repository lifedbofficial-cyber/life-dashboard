import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Brain, X, Send, Minimize2, Sparkles } from 'lucide-react';

function generateResponse(input, { habits, goals, transactions, moods, health, user, levelData }) {
  const lower = input.toLowerCase();
  const today = new Date().toDateString();
  const thisMonth = new Date().getMonth();

  const todayDone = habits.filter(h => h.completedDates?.includes(today)).length;
  const monthTx = transactions.filter(t => new Date(t.date).getMonth() === thisMonth);
  const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const weekMoods = moods.slice(-7);
  const avgMood = weekMoods.length > 0 ? weekMoods.reduce((s, m) => s + m.mood, 0) / weekMoods.length : 0;
  const todayHealth = health[today] || {};

  // Greeting
  if (lower.match(/^(hi|hello|hey|sup|yo)/)) {
    const hour = new Date().getHours();
    const time = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    return `Good ${time}, ${user.name}! 👋 I'm your AI Life Coach. You're Level ${levelData.level} with ${user.totalXP} XP. How can I help you today?`;
  }

  // Habit questions
  if (lower.includes('habit')) {
    if (todayDone === habits.length && habits.length > 0)
      return `🏆 Incredible! You've completed all ${habits.length} habits today! Your streak is ${user.streak} days. You're building serious momentum!`;
    return `You've done ${todayDone}/${habits.length} habits today. ${habits.length - todayDone > 0 ? `Focus on completing the remaining ${habits.length - todayDone} to maximize today's Life Score!` : ''}`;
  }

  // Finance questions
  if (lower.match(/finance|money|spend|income|saving/)) {
    if (income === 0) return `No income logged this month yet. Head to Finance → Add → Income to track your earnings. 💰`;
    const rate = Math.round(((income - expenses) / income) * 100);
    if (rate < 0) return `⚠️ You're spending ₹${(expenses - income).toLocaleString()} more than you earn this month. I'd suggest reducing discretionary expenses like entertainment and shopping first.`;
    if (rate > 30) return `💚 You're saving ${rate}% of your income this month — that's excellent! Financial experts recommend 20%+. Keep it up!`;
    return `You're saving ${rate}% of your income (₹${(income - expenses).toLocaleString()}). Try to push toward 30%+ for long-term wealth building.`;
  }

  // Mood questions
  if (lower.match(/mood|feel|emotion|stress|happy/)) {
    if (weekMoods.length === 0) return `You haven't logged your mood this week. Try logging daily — it helps me give better insights! Head to Mood Tracker.`;
    const emoji = avgMood >= 4 ? '😄' : avgMood >= 3 ? '😊' : avgMood >= 2 ? '😐' : '😔';
    return `Your average mood this week is ${avgMood.toFixed(1)}/5 ${emoji}. ${avgMood < 3 ? "When you're feeling low, try: 10-min walk, journaling, or calling a friend." : "You're in a great headspace! Keep your positive habits going."}`;
  }

  // Health
  if (lower.match(/health|water|steps|sleep|workout/)) {
    const issues = [];
    if ((todayHealth.water || 0) < 8) issues.push(`drink ${8 - (todayHealth.water || 0)} more glasses of water`);
    if (!todayHealth.workout) issues.push('complete your workout');
    if ((todayHealth.sleep || 0) < 7) issues.push('aim for 7-8 hours of sleep tonight');
    if (issues.length === 0) return `❤️ Great health day! All your metrics are on track. Keep it up!`;
    return `For better health today: ${issues.join(', ')}. Small improvements compound over time!`;
  }

  // XP / Level
  if (lower.match(/xp|level|score|point/)) {
    return `You have ${user.totalXP} XP and you're Level ${levelData.level} (${levelData.title}). You need ${levelData.xpForLevel} more XP to reach Level ${levelData.level + 1}. Complete habits and log daily to earn XP faster! ⭐`;
  }

  // Goal questions
  if (lower.match(/goal|target|aim/)) {
    const active = goals.filter(g => !g.completed);
    const done = goals.filter(g => g.completed);
    return `You have ${active.length} active goal${active.length !== 1 ? 's' : ''} and ${done.length} completed. ${active.length > 0 ? `Focus on: "${active[0].title}" — you're at ${active[0].progress}/${active[0].target} ${active[0].unit}.` : 'Add a new goal in the Goals section!'}`;
  }

  // Streak
  if (lower.includes('streak')) {
    if (user.streak === 0) return `You don't have a streak yet. Complete any habit today to start one! Even 1 day is a start. 🌱`;
    if (user.streak >= 30) return `🔥 ${user.streak} days! You're absolutely legendary! That's elite-level consistency.`;
    return `Your streak is ${user.streak} days! ${user.streak >= 7 ? '🔥 Keep crushing it!' : 'Build to 7 days for your first milestone!'}`;
  }

  // Tips
  if (lower.match(/tip|advice|suggest|help|improve/)) {
    const tips = [
      `Complete your habits before 10am — morning momentum carries through the day.`,
      `Track your mood daily. Users who log mood consistently report 40% better self-awareness.`,
      `Set a monthly savings goal in Finance. Even ₹500/month compounds significantly over time.`,
      `Your best habit streak is your most valuable asset. Protect it like gold.`,
      `Journal 3 things you're grateful for tonight — it rewires your brain for positivity.`,
    ];
    return `💡 ${tips[Math.floor(Math.random() * tips.length)]}`;
  }

  // Productivity
  if (lower.match(/productiv|focus|work|study/)) {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return `⚡ Peak focus time! Your brain is sharpest now. Tackle your hardest task first (MIT — Most Important Task). Put your phone away for 90 minutes.`;
    if (hour >= 14 && hour < 16) return `😴 Post-lunch dip. This is normal. Take a 10-min walk or do a quick workout to restore energy.`;
    return `For maximum productivity: work in 90-min focused blocks, take 15-min breaks, and batch similar tasks together.`;
  }

  // Default smart response
  const defaults = [
    `Today you've completed ${todayDone}/${habits.length} habits. ${user.streak > 0 ? `Your ${user.streak}-day streak is on the line — don't break it!` : 'Start a streak today!'}`,
    `You're Level ${levelData.level} with ${user.totalXP} XP. Ask me about habits, finance, mood, goals, or health for personalized insights!`,
    `Pro tip: The most successful users log something every single day — even if it's just mood. Consistency beats intensity. 💪`,
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

const QUICK_PROMPTS = ['How are my habits?', 'Finance check', 'Give me a tip', 'My mood this week', 'How to earn more XP?'];

export default function AICoach() {
  const appData = useApp();
  const { user } = appData;
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Hey ${user?.name || 'there'}! 👋 I'm your AI Life Coach. I analyze your habits, finance, mood and health to give you personalized insights. What would you like to know?`, time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg, time: new Date() }]);
    setTyping(true);
    setTimeout(() => {
      const response = generateResponse(msg, appData);
      setMessages(prev => [...prev, { role: 'ai', text: response, time: new Date() }]);
      setTyping(false);
    }, 800 + Math.random() * 600);
  };

  return (
    <>
      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
        onClick={() => { setOpen(true); setMinimized(false); }}
        className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-40 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', boxShadow: '0 8px 32px rgba(124,58,237,0.5)' }}>
        <Brain size={22} className="text-white" />
        <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && !minimized && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="fixed bottom-20 lg:bottom-24 right-3 lg:right-6 z-50 w-[calc(100vw-24px)] lg:w-[380px] rounded-3xl overflow-hidden flex flex-col"
            style={{ maxHeight: '70vh', background: 'rgba(12,10,24,0.97)', border: '1px solid rgba(139,92,246,0.3)', boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.1)' }}>

            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(139,92,246,0.1)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
                <Brain size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>AI Life Coach</div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-xs text-muted">Always online</span>
                </div>
              </div>
              <button onClick={() => setMinimized(true)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all">
                <Minimize2 size={13} style={{ color: 'var(--text-muted)' }} />
              </button>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all">
                <X size={13} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
                    style={{
                      background: m.role === 'user' ? 'linear-gradient(135deg, #7c3aed, #5b21b6)' : 'rgba(255,255,255,0.06)',
                      color: 'var(--text-primary)',
                      borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      border: m.role === 'ai' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    }}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {typing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                          className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
              {QUICK_PROMPTS.map(p => (
                <button key={p} onClick={() => send(p)}
                  className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full transition-all whitespace-nowrap"
                  style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)', color: '#a78bfa' }}>
                  {p}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                  placeholder="Ask your AI coach..."
                  className="flex-1 text-sm px-4 py-2.5 rounded-xl outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }} />
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => send()}
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: input.trim() ? 'linear-gradient(135deg, #7c3aed, #06b6d4)' : 'rgba(255,255,255,0.07)' }}>
                  <Send size={15} className="text-white" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}