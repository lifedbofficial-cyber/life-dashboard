import { motion } from 'framer-motion'

export default function RingProgress({ value = 0, max = 100, size = 80, stroke = 6, color = '#7C3AED', label, sublabel, children }) {
  const radius = (size - stroke * 2) / 2
  const circumference = 2 * Math.PI * radius
  const percent = Math.min(value / max, 1)
  const offset = circumference - percent * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Track */}
        <svg width={size} height={size} className="absolute inset-0">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={stroke}
          />
        </svg>

        {/* Progress */}
        <svg width={size} height={size} className="absolute inset-0 -rotate-90">
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          {children || (
            <span className="font-display text-sm font-bold text-white">
              {Math.round(percent * 100)}%
            </span>
          )}
        </div>
      </div>

      {label && <div className="text-xs text-white/60 font-medium text-center">{label}</div>}
      {sublabel && <div className="text-[10px] text-white/30 text-center">{sublabel}</div>}
    </div>
  )
}
