import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import ReactConfetti from 'react-confetti'
import { useWindowSize } from '../hooks/useWindowSize'

export default function AchievementPopup() {
  const { recentAchievement } = useStore()
  const { width, height } = useWindowSize()

  return (
    <AnimatePresence>
      {recentAchievement && (
        <>
          <ReactConfetti
            width={width}
            height={height}
            numberOfPieces={150}
            recycle={false}
            gravity={0.3}
            colors={['#7C3AED', '#A78BFA', '#39FF14', '#06B6D4', '#F59E0B', '#EC4899']}
            style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }}
          />

          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[9998] 
                       flex items-center gap-4 px-6 py-4 rounded-2xl
                       bg-bg-card border border-accent-amber/40
                       shadow-[0_0_40px_rgba(245,158,11,0.25)]"
          >
            {/* Glow ring */}
            <div className="w-12 h-12 rounded-xl bg-accent-amber/10 border border-accent-amber/30 
                           flex items-center justify-center text-2xl flex-shrink-0 animate-pulse">
              {recentAchievement.icon}
            </div>

            <div>
              <div className="text-[10px] font-mono text-accent-amber uppercase tracking-widest mb-0.5">
                Achievement Unlocked!
              </div>
              <div className="font-display text-sm font-bold text-white">{recentAchievement.title}</div>
              <div className="text-xs text-white/50 mt-0.5">{recentAchievement.desc}</div>
            </div>

            <div className="ml-4 text-right">
              <div className="font-display font-bold text-accent-neon-dim text-lg">+{recentAchievement.xp}</div>
              <div className="text-[10px] text-white/30">XP</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
