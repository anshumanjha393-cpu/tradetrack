import { createContext, useContext, useState, ReactNode } from 'react'

type Currency = 'USD' | 'INR'

interface CurrencyContextType {
  currency: Currency
  setCurrency: (c: Currency) => void
  symbol: string
}

const CurrencyContext = createContext<CurrencyContextType | null>(null)

const symbols: Record<Currency, string> = { USD: '$', INR: '₹' }

/**
 * Provides the user's currency preference (USD or INR) and persists it to localStorage.
 * Wraps the app to enable currency-aware formatting via `useCurrencyFormatter()`.
 */
export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(
    () => (localStorage.getItem('currency') as Currency) || 'USD',
  )

  const handleSetCurrency = (c: Currency) => {
    localStorage.setItem('currency', c)
    setCurrency(c)
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, symbol: symbols[currency] }}>
      {children}
    </CurrencyContext.Provider>
  )
}

/** Hook to access currency context. Throws if used outside `<CurrencyProvider>`. */
export const useCurrency = () => {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider')
  return ctx
}
