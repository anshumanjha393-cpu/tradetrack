import { useState, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/lib/auth-context'
import { useCurrency } from '@/lib/currency-context'
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  PieChart,
  FileText,
  PiggyBank,
  Target,
  Menu,
  X,
  LogOut,
  DollarSign,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Accounts', href: '/accounts', icon: Wallet },
  { label: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
  { label: 'Portfolio', href: '/portfolio', icon: PieChart },
  { label: 'Reports', href: '/reports', icon: FileText },
  { label: 'Budgets', href: '/budgets', icon: PiggyBank },
  { label: 'Goals', href: '/goals', icon: Target },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation()

  return (
    <nav className="flex flex-col gap-1" aria-label="Primary">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive =
          item.href !== '/' ? location.pathname === item.href : location.pathname === '/'

        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            className={cn(
              'group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors touch-target',
              'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
              isActive && 'bg-sidebar-accent/60 text-sidebar-accent-foreground',
            )}
          >
            <span
              className={cn(
                'absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-opacity',
                isActive ? 'opacity-100' : 'opacity-0',
              )}
              aria-hidden="true"
            />
            <Icon className="size-5 shrink-0" strokeWidth={1.75} />
            <span className="font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export function Sidebar() {
  const [open, setOpen] = useState(false)

  const closeDrawer = useCallback(() => setOpen(false), [])

  // Close drawer on route change
  // We use useEffect below for this

  return (
    <>
      {/* Mobile top bar - sticky */}
      <header
        className={cn(
          'sticky top-0 z-40 flex items-center justify-between border-b border-sidebar-border bg-background/80 px-4 py-3 backdrop-blur-xl sm:px-5 lg:hidden',
          // Hide top bar when drawer is open on mobile
        )}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="touch-target flex items-center justify-center rounded-xl border border-border p-2 text-foreground"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <Brand compact />
        </div>
        <div className="flex items-center gap-2">
          <MobileCurrencyToggle />
          <UserAvatar />
        </div>
      </header>

      {/* Mobile drawer with Framer Motion */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={closeDrawer}
              aria-hidden="true"
            />
            {/* Drawer panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-sidebar-border bg-sidebar p-6 lg:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <Brand />
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="touch-target flex items-center justify-center rounded-xl p-2 text-muted-foreground hover:text-foreground"
                  aria-label="Close menu"
                >
                  <X className="size-5" />
                </button>
              </div>
              <NavLinks onNavigate={closeDrawer} />
              <div className="mt-auto">
                <Profile onNavigate={closeDrawer} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col gap-10 border-r border-sidebar-border bg-sidebar p-6 xl:w-72 xl:p-7 lg:flex">
        <Brand />
        <NavLinks />
        <div className="mt-auto">
          <Profile />
        </div>
      </aside>
    </>
  )
}

function MobileCurrencyToggle() {
  const { currency, setCurrency } = useCurrency()

  return (
    <div className="flex gap-1 rounded-xl border border-border p-0.5">
      {(['USD', 'INR'] as const).map((c) => (
        <button
          key={c}
          onClick={() => setCurrency(c)}
          className={cn(
            'touch-target flex items-center justify-center rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
            currency === c
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {c === 'USD' ? '$' : '₹'}
        </button>
      ))}
    </div>
  )
}

function UserAvatar() {
  const { user } = useAuth()
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??'

  return (
    <span className="flex size-8 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
      {initials}
    </span>
  )
}

function Brand({ compact }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <span className="font-heading text-lg font-bold">T</span>
      </span>
      {!compact && (
        <span className="font-heading text-xl font-semibold tracking-tight text-foreground">
          TradeTrack
        </span>
      )}
    </Link>
  )
}

function Profile({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth()
  const { currency, setCurrency } = useCurrency()
  const navigate = useNavigate()
  const [showLogout, setShowLogout] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/auth')
    onNavigate?.()
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??'

  return (
    <div className="relative">
      <button
        onClick={() => setShowLogout((v) => !v)}
        className="touch-target w-full flex items-center gap-3 rounded-2xl border border-sidebar-border bg-sidebar-accent/40 p-3 hover:bg-sidebar-accent/60 transition-colors"
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
          {initials}
        </span>
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-medium text-sidebar-accent-foreground">
            {user?.name || 'User'}
          </p>
          <p className="truncate text-xs text-sidebar-foreground">
            {user?.email || ''}
          </p>
        </div>
      </button>

      {showLogout && (
        <div className="absolute bottom-full mb-2 w-full rounded-2xl border border-sidebar-border bg-sidebar p-1 shadow-lg">
          <div className="px-3 py-2 mb-1">
            <div className="flex items-center gap-2 text-xs text-sidebar-foreground mb-2">
              <DollarSign className="size-3" />
              <span>Currency</span>
            </div>
            <div className="flex gap-1">
              {(['USD', 'INR'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={cn(
                    'touch-target flex-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors',
                    currency === c
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="touch-target flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-destructive transition-colors"
          >
            <LogOut className="size-4" />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  )
}
export default Sidebar
