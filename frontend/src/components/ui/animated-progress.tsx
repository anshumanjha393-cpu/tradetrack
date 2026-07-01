import { motion } from 'motion/react'

interface AnimatedProgressProps {
  value: number
  max?: number
  showLabel?: boolean
}

function getColor(percent: number) {
  if (percent > 100) return '#FF1744'
  if (percent > 80) return '#FF6600'
  return '#FF5500'
}

export function AnimatedProgress({
  value,
  max = 100,
  showLabel = false,
}: AnimatedProgressProps) {
  const rawPercent = (value / max) * 100
  const percent = Math.min(rawPercent, 120)
  const barPercent = Math.min(rawPercent, 100)
  const color = getColor(percent)

  return (
    <div className="relative h-4 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
      <motion.div
        className="absolute left-0 top-0 h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${barPercent}%` }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
      />
      {showLabel && barPercent > 18 && (
        <span
          className="absolute inset-0 flex items-center pl-2 text-[10px] font-semibold mix-blend-difference"
          style={{ color: '#ffffff' }}
          aria-hidden="true"
        >
          {Math.round(percent)}%
        </span>
      )}
    </div>
  )
}
