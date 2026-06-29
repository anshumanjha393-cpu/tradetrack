import { useEffect, useMemo, useState } from 'react'
import { Wallet, TrendingDown, PiggyBank, LineChart } from 'lucide-react'
import { api } from '@/lib/api'
import { useCurrencyFormatter } from '@/lib/use-currency-formatter'
import { StatCard } from '@/components/ui/stat-card'
import { AnimatedCounter } from '@/components/ui/animated-counter'

interface Summary {
  monthlyIncome: number
  monthlyExpenses: number
  netSavings: number
  portfolioValue: number
}

export function StatCards() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const formatCurrency = useCurrencyFormatter()

  useEffect(() => {
    api.getSummary().then(setSummary)
  }, [])

  const stats = useMemo(() => {
    const income = summary?.monthlyIncome ?? 0
    const expenses = summary?.monthlyExpenses ?? 0
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0
    const portfolio = summary?.portfolioValue ?? 0
    return { income, expenses, savingsRate, portfolio }
  }, [summary])

  const { income, expenses, savingsRate, portfolio } = stats

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
      <StatCard icon={Wallet} label="Monthly Income" accent="success">
        <AnimatedCounter
          value={income}
          format={(n) => formatCurrency(Math.round(n))}
          className="font-heading text-lg font-semibold text-foreground sm:text-2xl"
        />
      </StatCard>

      <StatCard icon={TrendingDown} label="Monthly Expenses" accent="destructive">
        <AnimatedCounter
          value={expenses}
          format={(n) => formatCurrency(Math.round(n))}
          className="font-heading text-lg font-semibold text-foreground sm:text-2xl"
        />
      </StatCard>

      <StatCard icon={PiggyBank} label="Savings Rate" accent="primary">
        <AnimatedCounter
          value={savingsRate}
          duration={1.8}
          format={(n) => `${n.toFixed(1)}%`}
          className="font-heading text-lg font-semibold text-foreground sm:text-2xl"
        />
      </StatCard>

      <StatCard icon={LineChart} label="Portfolio Value" accent="primary">
        <AnimatedCounter
          value={portfolio}
          format={(n) => formatCurrency(Math.round(n), { compact: true })}
          className="font-heading text-lg font-semibold text-foreground sm:text-2xl"
        />
      </StatCard>
    </div>
  )
}
