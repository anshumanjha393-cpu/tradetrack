import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useCurrencyFormatter } from '@/lib/use-currency-formatter'

interface Budget {
  id: string
  monthlyLimit: string
  category: { name: string }
}

interface Transaction {
  id: string
  amount: string
  categoryId: string | null
  date: string
  category: { name: string; type: string } | null
}

export function BudgetStatus() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const formatCurrency = useCurrencyFormatter()

  useEffect(() => {
    Promise.all([api.getBudgets(), api.getTransactions()]).then(([b, t]) => {
      setBudgets(Array.isArray(b) ? b : b.value ?? [])
      setTransactions(Array.isArray(t) ? t : t.value ?? [])
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <section className="glass rounded-xl p-5 sm:p-7">
        <div className="animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="h-3 w-32 rounded bg-secondary mb-2" />
              <div className="h-2 w-full rounded bg-secondary" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (budgets.length === 0) {
    return (
      <section className="glass rounded-xl p-5 sm:p-7">
        <h3 className="font-heading text-base text-foreground mb-3 sm:text-lg">Budget Status</h3>
        <p className="text-xs text-muted-foreground sm:text-sm">No budgets set yet.</p>
      </section>
    )
  }

  const now = new Date()
  const currentMonth = now.getMonth()

  const spentByCategory: Record<string, number> = {}
  transactions.forEach((t) => {
    const d = new Date(t.date)
    if (d.getMonth() === currentMonth && t.category?.type === 'expense') {
      const name = t.category.name
      spentByCategory[name] = (spentByCategory[name] || 0) + Math.abs(Number(t.amount))
    }
  })

  return (
    <section className="glass rounded-xl p-5 sm:p-7">
      <div className="mb-4 flex items-center justify-between sm:mb-5">
        <h3 className="font-heading text-base text-foreground sm:text-lg">Budget Status</h3>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">
          {now.toLocaleString('default', { month: 'long' })}
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
        {budgets.map((b) => {
          const limit = parseFloat(b.monthlyLimit)
          const spent = spentByCategory[b.category.name] || 0
          const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
          return (
            <div key={b.id}>
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <span className="text-xs font-medium text-foreground sm:text-sm">{b.category.name}</span>
                <span className="text-[10px] tabular-nums text-muted-foreground sm:text-xs">
                  {formatCurrency(spent)} / {formatCurrency(limit)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: pct > 100 ? '#FF1744' : pct > 80 ? '#FF6600' : 'var(--primary)',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
