import { motion } from 'framer-motion';

export default function StatCard({ icon, label, value, sub, color = 'purple', delay = 0, onClick, progress }) {
  const colors = {
    purple: { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)', text: '#a78bfa', glow: 'rgba(139,92,246,0.2)' },
    cyan: { bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.25)', text: '#22d3ee', glow: 'rgba(6,182,212,0.2)' },
    amber: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', text: '#fbbf24', glow: 'rgba(245,158,11,0.2)' },
    emerald: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', text: '#34d399', glow: 'rgba(16,185,129,0.2)' },
    rose: { bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.25)', text: '#fb7185', glow: 'rgba(244,63,94,0.2)' },
    blue: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)', text: '#60a5fa', glow: 'rgba(59,130,246,0.2)' },
  };
  const c = colors[color] || colors.purple;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="glass-card p-5 relative overflow-hidden"
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 opacity-50 pointer-events-none" style={{
        background: `radial-gradient(circle at top right, ${c.glow}, transparent 70%)`,
      }} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ background: c.bg, border: `1px solid ${c.border}` }}>
            {icon}
          </div>
          {sub && <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>{sub}</span>}
        </div>

        <div className="font-display font-bold text-2xl mb-0.5" style={{ color: c.text }}>
          {value}
        </div>
        <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{label}</div>

        {progress !== undefined && (
          <div className="mt-3 xp-bar" style={{ height: '4px', background: 'rgba(255,255,255,0.07)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 1, delay: delay + 0.3, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${c.text}, ${c.text}aa)` }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
