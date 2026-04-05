import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const FEATURES = [
  { icon: '🔥', title: 'Habit Tracker', desc: 'Build atomic habits daily. Drag to reorder. GitHub-style heatmap shows your consistency over time.' },
  { icon: '🎯', title: 'Goal Engine', desc: 'Set targets with milestones. Track progress. Earn XP when you hit them.' },
  { icon: '⭐', title: 'XP & Leveling', desc: 'Every action earns XP. Level up through 20 tiers. Unlock achievements as you grow.' },
  { icon: '🧠', title: 'AI Life Coach', desc: 'A personal coach that reads your data and gives smart, personalized insights every day.' },
  { icon: '💰', title: 'Finance Tracker', desc: 'Track income, expenses, and savings. Set budgets per category. Yearly summary chart.' },
  { icon: '😊', title: 'Mood & Health', desc: 'Log mood, water, steps, sleep, and workouts. See how your body and mind connect.' },
  { icon: '📖', title: 'Journal', desc: 'Private journal with mood tags. Rich text. Your thoughts, safe in the cloud.' },
  { icon: '🏆', title: 'Life Score™', desc: 'A daily score 0–100 combining habits, health, and finance. One number that tells you everything.' },
];

const TESTIMONIALS = [
  { name: 'Priya S.', role: 'Software Engineer', text: 'I\'ve tried 10 habit apps. This is the only one I actually open every day. The XP system makes it addictive.', avatar: '👩‍💻' },
  { name: 'Rahul M.', role: 'Entrepreneur', text: 'The finance tracker + habit tracker combo is genius. I saved ₹40,000 in 3 months just by being more aware.', avatar: '👨‍💼' },
  { name: 'Ananya K.', role: 'Student', text: 'My life score went from 34 to 78 in 6 weeks. I can literally see myself improving every day.', avatar: '👩‍🎓' },
];

const STATS = [
  { value: '50K+', label: 'Habits tracked' },
  { value: '20', label: 'XP levels' },
  { value: '17', label: 'Achievements' },
  { value: '100%', label: 'Free to use' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try { await login(); }
    catch {}
    setLoading(false);
  };

  return (
    <div style={{ background: '#080612', color: '#fff', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif' }}>

      {/* Ambient background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', left: '20%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12), transparent 60%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', top: '40%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.08), transparent 60%)', filter: 'blur(60px)' }} />
      </div>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(8,6,18,0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.3s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>◈</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18 }}>LIFE OS</span>
        </div>
        <button onClick={handleLogin} disabled={loading}
          style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', color: '#a78bfa', borderRadius: 12, padding: '8px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          Sign in
        </button>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '100px 24px 60px' }}>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 13, color: '#a78bfa', marginBottom: 28 }}>
            ✨ 100% Free · No credit card needed
          </div>

          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(36px, 7vw, 72px)', lineHeight: 1.1, marginBottom: 24, maxWidth: 800 }}>
            Control Your Life.{' '}
            <span style={{ background: 'linear-gradient(135deg, #a78bfa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Powered by AI.
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: 'rgba(255,255,255,0.55)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.6 }}>
            The gamified life OS that helps you build habits, track goals, manage money, and level up — all in one place.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={handleLogin} disabled={loading}
              style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', border: 'none', color: '#fff', borderRadius: 16, padding: '16px 36px', fontSize: 16, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(124,58,237,0.4)' }}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Start for free with Google
            </motion.button>

            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', borderRadius: 16, padding: '16px 28px', fontSize: 16, fontWeight: 500, cursor: 'pointer' }}>
              See features ↓
            </motion.button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
            {STATS.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, background: 'linear-gradient(135deg, #a78bfa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.value}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
          style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.2)', fontSize: 24 }}>
          ↓
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" style={{ position: 'relative', zIndex: 1, padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(28px, 5vw, 48px)', marginBottom: 16 }}>
            Everything you need to{' '}
            <span style={{ background: 'linear-gradient(135deg, #a78bfa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>level up</span>
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.45)', maxWidth: 500, margin: '0 auto' }}>
            8 powerful modules. One beautiful dashboard. Zero excuses.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {FEATURES.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.02, y: -4 }}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '24px', cursor: 'default', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Life Score showcase */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 24px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(28px, 5vw, 48px)', marginBottom: 16 }}>
            Your Life Score™
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.45)', maxWidth: 500, margin: '0 auto 48px' }}>
            One number that shows how well you're living today. Updated every time you log something.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
            {[
              { score: 82, label: 'Great day', color: '#10b981' },
              { score: 54, label: 'Average day', color: '#f59e0b' },
              { score: 23, label: 'Rough day', color: '#f43f5e' },
            ].map(s => (
              <motion.div key={s.label} whileHover={{ scale: 1.05 }}
                style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${s.color}30`, borderRadius: 24, padding: '32px 40px', minWidth: 160 }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 52, color: s.color, lineHeight: 1 }}>{s.score}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 24px', maxWidth: 900, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(28px, 5vw, 40px)', marginBottom: 12 }}>People are leveling up 🚀</h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.name}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24 }}>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>"{t.text}"</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{t.avatar}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 24px 120px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.1))', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 32, padding: '60px 24px', maxWidth: 640, margin: '0 auto' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(28px, 5vw, 40px)', marginBottom: 16 }}>
            Ready to level up your life?
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 32 }}>
            Free forever. No credit card. Just you and your goals.
          </p>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={handleLogin} disabled={loading}
            style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', border: 'none', color: '#fff', borderRadius: 16, padding: '18px 40px', fontSize: 18, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 32px rgba(124,58,237,0.4)', fontFamily: 'Syne, sans-serif' }}>
            Get Started Free →
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 7, background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>◈</div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14 }}>LIFE OS</span>
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>Control Your Life. Powered by AI. · Built with ❤️</p>
      </footer>
    </div>
  );
}