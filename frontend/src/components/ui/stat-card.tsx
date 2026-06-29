import { motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type Accent = 'primary' | 'success' | 'destructive'

type StatCardProps = {
  icon: LucideIcon
  label: string
  accent?: Accent
  className?: string
  children: React.ReactNode
}

const iconAccent: Record<Accent, string> = {
  primary: 'text-primary',
  success: 'text-success',
  destructive: 'text-destructive',
}

const glowAccent: Record<Accent, string> = {
  primary: 'bg-primary/20',
  success: 'bg-success/20',
  destructive: 'bg-destructive/20',
}

export function StatCard({
  icon: Icon,
  label,
  accent = 'primary',
  className,
  children,
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={cn('group relative', className)}
    >
      <div
        className={cn(
          'pointer-events-none absolute -inset-2 rounded-[2rem] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100',
          glowAccent[accent],
        )}
      />
      <div className="glass relative overflow-hidden rounded-xl p-4 sm:p-6">
        <span
          className={cn(
            'flex size-8 items-center justify-center rounded-2xl bg-secondary sm:size-10',
            iconAccent[accent],
          )}
        >
          <Icon className="size-4 sm:size-5" strokeWidth={1.75} />
        </span>
        <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:mt-4 sm:text-xs">
          {label}
        </p>
        <div className="mt-1.5 sm:mt-2">{children}</div>
      </div>
    </motion.div>
  )
}
