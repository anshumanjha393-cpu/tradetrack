import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Sidebar } from './components/sidebar'
import { ProtectedRoute, PublicRoute } from './components/protected-route'
import './index.css'

const DashboardPage = lazy(() => import('./app/page'))
const AccountsPage = lazy(() => import('./app/accounts/page'))
const BudgetsPage = lazy(() => import('./app/budgets/page'))
const GoalsPage = lazy(() => import('./app/goals/page'))
const TransactionsPage = lazy(() => import('./app/transactions/page'))
const PortfolioPage = lazy(() => import('./app/portfolio/page'))
const ReportsPage = lazy(() => import('./app/reports/page'))
const AuthPage = lazy(() => import('./app/auth/page'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18, ease: 'easeInOut' }}
        className="min-h-full"
      >
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
            <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/accounts" element={<ProtectedRoute><AccountsPage /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
            <Route path="/portfolio" element={<ProtectedRoute><PortfolioPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="/budgets" element={<ProtectedRoute><BudgetsPage /></ProtectedRoute>} />
            <Route path="/goals" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}

function Layout() {
  const location = useLocation()
  const showSidebar = location.pathname !== '/auth'

  return (
    <div className="flex min-h-svh bg-background">
      {/* Skip-to-content accessibility link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:outline-none"
      >
        Skip to main content
      </a>

      {showSidebar && <Sidebar />}
      <main id="main-content" className="min-w-0 flex-1 pb-20 lg:pb-0">
        <AnimatedRoutes />
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}

export default App
