import { motion } from 'motion/react'

interface AnimatedProgressProps {
  value: number
  max?: number
  showLabel?: boolean
}

function getColor(value: number) {
  if (value > 100) return '#FF1744'
  if (value > 80) return '#FF6600'
  return '#FF5500'
}

export function AnimatedProgress({
  value,
  max = 100,
  showLabel = false,
}: AnimatedProgressProps) {
  const percent = Math.min((value / max) * 100, 120)
  const color = getColor(percent)

  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
      <motion.div
        className="absolute left-0 top-0 h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(percent, 100)}%` }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
      />
      {showLabel && (
        <span className="mt-1 text-xs" style={{ color }}>
          {Math.round(percent)}%
        </span>
      )}
    </div>
  )
}
