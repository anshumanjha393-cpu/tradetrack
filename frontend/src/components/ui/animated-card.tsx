import { motion } from 'motion/react'
import { type ReactNode } from 'react'

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function AnimatedCard({
  children,
  className = '',
  delay = 0,
}: AnimatedCardProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay }}
      whileHover={{
        y: -4,
        boxShadow: '0 8px 32px rgba(255, 85, 0, 0.15)',
        transition: { duration: 0.2 },
      }}
    >
      {children}
    </motion.div>
  )
}
