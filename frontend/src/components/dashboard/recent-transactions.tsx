import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { api } from '@/lib/api'
import { type Category } from '@/lib/data'
import { useCurrencyFormatter } from '@/lib/use-currency-formatter'
import { CategoryIcon } from '@/components/category-icon'

interface Transaction {
  id: string
  description: string
  amount: string
  date: string
  category?: { name: string; type: string }
  account?: { name: string }
}

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const formatCurrency = useCurrencyFormatter()

  useEffect(() => {
    api.getTransactions().then((res) => {
      const list = Array.isArray(res) ? res : res.value ?? []
      setTransactions(list.slice(0, 6))
      setLoading(false)
    })
  }, [])

  const renderedItems = useMemo(
    () =>
      transactions.map((t) => {
        const amount = parseFloat(t.amount)
        const income = t.category?.type === 'income'
        return (
          <li
            key={t.id}
            className="flex items-center gap-3 border-b border-border py-2.5 last:border-0 sm:gap-4 sm:py-3"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-2xl bg-secondary text-muted-foreground sm:size-10">
              <CategoryIcon category={(t.category?.name ?? '') as Category} className="size-4 sm:size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-foreground sm:text-sm">{t.description}</p>
              <p className="text-[10px] text-muted-foreground sm:text-xs">
                {t.category?.name ?? 'Uncategorized'} ·{' '}
                {new Date(t.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
            <span className={income ? 'text-xs font-medium tabular-nums text-success sm:text-sm' : 'text-xs font-medium tabular-nums text-foreground sm:text-sm'}>
              {formatCurrency(amount, { sign: income })}
            </span>
          </li>
        )
      }),
    [transactions, formatCurrency],
  )

  return (
    <section className="glass flex h-full flex-col rounded-xl p-5 sm:p-7">
      <div className="mb-4 flex items-center justify-between sm:mb-5">
        <h3 className="font-heading text-base text-foreground sm:text-lg">Recent Transactions</h3>
        <Link
          to="/transactions"
          className="touch-target inline-flex items-center gap-1 text-xs text-primary transition-opacity hover:opacity-80 sm:text-sm"
        >
          View all <ArrowRight className="size-3.5 sm:size-4" />
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="size-9 rounded-2xl bg-secondary sm:size-10" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 rounded bg-secondary" />
                <div className="h-3 w-20 rounded bg-secondary" />
              </div>
              <div className="h-3 w-16 rounded bg-secondary" />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <p className="text-xs text-muted-foreground sm:text-sm">No transactions yet.</p>
      ) : (
        <ul className="flex flex-col">
          {renderedItems}
        </ul>
      )}
    </section>
  )
}
