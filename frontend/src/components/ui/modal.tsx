import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Loader2 } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  onSubmit?: () => void
  submitLabel?: string
  loading?: boolean
  error?: string
  maxWidth?: string
}

export function Modal({
  open,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = 'Save',
  loading = false,
  error,
  maxWidth = 'max-w-lg',
}: ModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={backdropRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
          onClick={(e) => {
            if (e.target === backdropRef.current) onClose()
          }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Mobile: full-screen slide-up. Desktop: centered card */}
          <motion.div
            initial={{ y: '100%', opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 1 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn('glass relative z-10 flex w-full flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl sm:border sm:border-border max-h-[90dvh] sm:max-h-[85dvh]', maxWidth)}
          >
            {/* Mobile drag handle */}
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
            </div>

            <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6 sm:py-4">
              <h3 className="font-heading text-lg font-semibold text-foreground">{title}</h3>
              <button
                onClick={onClose}
                className="touch-target flex items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-5">
              {children}
            </div>

            {onSubmit && (
              <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-4 sm:px-6 sm:py-4">
                {error && <p className="mr-auto text-sm text-destructive">{error}</p>}
                <Button variant="outline" size="sm" onClick={onClose} disabled={loading} className="touch-target">
                  Cancel
                </Button>
                <Button size="sm" onClick={onSubmit} disabled={loading} className="touch-target">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="size-3.5 animate-spin" /> Saving...
                    </span>
                  ) : (
                    submitLabel
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function FormField({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  )
}

const inputClass =
  'w-full rounded-xl border border-border bg-secondary/50 px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary placeholder:text-muted-foreground touch-target'

export function ModalInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ''}`} />
}

export function ModalSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputClass} ${props.className ?? ''}`} />
}
