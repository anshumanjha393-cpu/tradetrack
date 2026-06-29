import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Sidebar } from './components/sidebar'
import { ProtectedRoute, PublicRoute } from './components/protected-route'
import DashboardPage from './app/page'
import AccountsPage from './app/accounts/page'
import BudgetsPage from './app/budgets/page'
import GoalsPage from './app/goals/page'
import TransactionsPage from './app/transactions/page'
import PortfolioPage from './app/portfolio/page'
import ReportsPage from './app/reports/page'
import AuthPage from './app/auth/page'
import './index.css'

function Layout() {
  const location = useLocation()
  const showSidebar = location.pathname !== '/auth'

  return (
    <div className="flex min-h-svh bg-background">
      {showSidebar && <Sidebar />}
      <main className="min-w-0 flex-1 pb-20 lg:pb-0">
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
