import { useState, useCallback, createContext, useContext, ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CheckCircle2, XCircle, X } from 'lucide-react'

interface Toast {
  id: number
  type: 'success' | 'error'
  message: string
}

interface ToastContextType {
  toast: (type: 'success' | 'error', message: string) => void
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((type: 'success' | 'error', message: string) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const dismiss = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* ARIA live region so screen readers announce toasts */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              role={t.type === 'error' ? 'alert' : 'status'}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="glass flex items-center gap-3 rounded-xl px-4 py-3 shadow-2xl backdrop-blur-xl"
            >
              {t.type === 'success' ? (
                <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden="true" />
              ) : (
                <XCircle className="size-5 shrink-0 text-destructive" aria-hidden="true" />
              )}
              <span className="text-sm text-foreground">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="ml-2 shrink-0 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
