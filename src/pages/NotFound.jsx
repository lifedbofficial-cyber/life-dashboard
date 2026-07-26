import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        padding: '24px',
      }}
    >
      {/* Ambient glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '20%', left: '30%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.08), transparent 60%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.06), transparent 60%)', filter: 'blur(60px)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: 480 }}
      >
        {/* Big 404 */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div
            className="font-display font-black"
            style={{
              fontSize: 'clamp(100px, 20vw, 160px)',
              lineHeight: 1,
              background: 'linear-gradient(135deg, #a78bfa 0%, #22d3ee 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: 8,
            }}
          >
            404
          </div>
        </motion.div>

        {/* Icon */}
        <div style={{ fontSize: 48, marginBottom: 16 }}>🌌</div>

        {/* Heading */}
        <h1
          className="font-display font-bold"
          style={{ fontSize: 'clamp(22px, 4vw, 30px)', color: 'var(--text-primary)', marginBottom: 12 }}
        >
          Lost in the void
        </h1>

        {/* Description */}
        <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 36 }}>
          This page doesn't exist in your Life OS. Maybe you took a wrong turn while leveling up?
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/')}
            className="btn-primary"
            style={{ padding: '12px 28px', fontSize: 15 }}
          >
            <Home size={16} />
            Back to Dashboard
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(-1)}
            className="btn-secondary"
            style={{ padding: '12px 24px', fontSize: 15 }}
          >
            <ArrowLeft size={16} />
            Go Back
          </motion.button>
        </div>

        {/* Subtle hint */}
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 40, opacity: 0.5 }}>
          ◈ LIFE OS · Page Not Found
        </p>
      </motion.div>
    </div>
  );
}
