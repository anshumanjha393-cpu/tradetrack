import { useCallback, useEffect, useRef } from 'react'
import { animate, useInView, useMotionValue } from 'motion/react'
import { cn } from '@/lib/utils'

type AnimatedCounterProps = {
  value: number
  duration?: number
  format?: (n: number) => string
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
}

export function AnimatedCounter({
  value,
  duration = 1.6,
  format,
  prefix = '',
  suffix = '',
  decimals,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const mv = useMotionValue(0)

  const formatValue = useCallback((n: number): string => {
    if (format) return format(n)
    const num = decimals !== undefined
      ? n.toFixed(decimals)
      : Math.round(n).toLocaleString('en-US')
    return `${prefix}${num}${suffix}`
  }, [format, prefix, suffix, decimals])

  useEffect(() => {
    if (!inView) return
    const controls = animate(mv, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    })
    return () => controls.stop()
  }, [inView, value, duration, mv])

  useEffect(() => {
    const unsubscribe = mv.on('change', (latest) => {
      if (ref.current) ref.current.textContent = formatValue(latest)
    })
    return unsubscribe
  }, [mv, formatValue])

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {formatValue(0)}
    </span>
  )
}
