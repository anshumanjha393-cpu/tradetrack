import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './lib/auth-context.tsx'
import { CurrencyProvider } from './lib/currency-context.tsx'
import { ToastProvider } from './components/ui/toast.tsx'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CurrencyProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </CurrencyProvider>
    </AuthProvider>
  </StrictMode>,
)