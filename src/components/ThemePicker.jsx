import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { THEMES } from '../utils/themes';
import { Check } from 'lucide-react';

export default function ThemePicker() {
  const { theme, setThemeId } = useApp();

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🎨</span>
        <div>
          <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>App Theme</div>
          <div className="text-xs text-muted">Choose your visual style</div>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {Object.values(THEMES).map(t => (
          <motion.button key={t.id} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
            onClick={() => setThemeId(t.id)}
            className="flex flex-col items-center gap-2 p-2 rounded-2xl transition-all"
            style={{
              background: theme === t.id ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${theme === t.id ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.07)'}`,
            }}>
            {/* Color preview */}
            <div className="w-10 h-10 rounded-xl overflow-hidden relative flex-shrink-0"
              style={{ background: t.preview[0], border: `2px solid ${theme === t.id ? '#8b5cf6' : 'transparent'}` }}>
              <div className="absolute inset-0 flex items-end justify-end p-1">
                <div className="w-4 h-4 rounded-full" style={{ background: t.preview[1] }} />
              </div>
              <div className="absolute top-1 left-1 w-2.5 h-2.5 rounded-full" style={{ background: t.preview[2] }} />
              {theme === t.id && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check size={14} className="text-white drop-shadow" />
                </div>
              )}
            </div>
            <div className="text-center">
              <div className="text-lg leading-none">{t.emoji}</div>
              <div className="text-xs mt-1 font-medium" style={{ color: theme === t.id ? 'var(--accent-light)' : 'var(--text-muted)' }}>
                {t.name}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}