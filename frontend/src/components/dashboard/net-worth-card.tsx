import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { api } from '@/lib/api'
import { useCurrencyFormatter } from '@/lib/use-currency-formatter'
import { PerformanceChart } from '@/components/chart/performance-chart'
import { AnimatedCounter } from '@/components/ui/animated-counter'

interface Summary {
  netWorth: number
  monthlyIncome: number
  monthlyExpenses: number
  netSavings: number
  portfolioValue: number
  portfolioPnL: number
}

export function NetWorthCard() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const formatCurrency = useCurrencyFormatter()

  useEffect(() => {
    api.getSummary().then((data) => {
      setSummary(data)
      setLoading(false)
    })
  }, [])

  const derived = useMemo(() => {
    const netWorth = summary?.netWorth ?? 0
    const pnl = summary?.portfolioPnL ?? 0
    const pnlPct = summary?.portfolioValue
      ? ((pnl / (summary.portfolioValue - pnl)) * 100).toFixed(1)
      : '0.0'
    return { netWorth, pnl, pnlPct }
  }, [summary])

  if (loading) {
    return (
      <section className="glass overflow-hidden rounded-xl p-5 sm:p-7 md:p-9">
        <div className="animate-pulse">
          <div className="h-4 w-32 rounded bg-secondary mb-4" />
          <div className="h-10 w-48 rounded bg-secondary sm:h-16 sm:w-64 mb-4" />
          <div className="h-4 w-48 rounded bg-secondary" />
        </div>
      </section>
    )
  }

  const { netWorth, pnl, pnlPct } = derived

  return (
    <section className="glass overflow-hidden rounded-xl p-5 sm:p-7 md:p-9">
      <div className="flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:text-sm">
            Total Net Worth
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 sm:gap-4">
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              <AnimatedCounter
                value={netWorth}
                format={(n) => formatCurrency(Math.round(n))}
              />
            </h2>
            {pnl !== 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success sm:px-3 sm:text-sm">
                <ArrowUpRight className="size-3 sm:size-4" />
                {pnlPct}%
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
            Portfolio P&L: {formatCurrency(pnl, { sign: true })}
          </p>
        </div>

        <dl className="grid grid-cols-3 gap-x-4 gap-y-3 sm:gap-x-8 sm:gap-y-4 lg:gap-x-10">
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">Income</dt>
            <dd className="mt-1 font-heading text-base text-foreground sm:text-xl">
              {formatCurrency(summary?.monthlyIncome ?? 0, { compact: true })}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">Expenses</dt>
            <dd className="mt-1 font-heading text-base text-foreground sm:text-xl">
              {formatCurrency(summary?.monthlyExpenses ?? 0, { compact: true })}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">Portfolio</dt>
            <dd className="mt-1 font-heading text-base text-foreground sm:text-xl">
              {formatCurrency(summary?.portfolioValue ?? 0, { compact: true })}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 border-t border-border pt-5 sm:mt-8 sm:pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-heading text-base text-foreground sm:text-lg">Portfolio Performance</h3>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">
            12 months
          </span>
        </div>
        <div className="h-[200px] sm:h-[280px] md:h-[360px]">
          <PerformanceChart />
        </div>
      </div>
    </section>
  )
}
