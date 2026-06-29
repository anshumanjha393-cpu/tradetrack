import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
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

function Layout() {
  const location = useLocation()
  const showSidebar = location.pathname !== '/auth'

  return (
    <div className="flex min-h-svh bg-background">
      {showSidebar && <Sidebar />}
      <main className="min-w-0 flex-1 pb-20 lg:pb-0">
        <Suspense fallback={<PageLoader />}>
          <Routes>
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
