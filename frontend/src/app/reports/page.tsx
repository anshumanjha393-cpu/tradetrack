import { useEffect, useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { CashflowSankey } from '@/components/chart/cashflow-sankey'
import { IncomeExpenseChart } from '@/components/chart/income-expense-chart'
import { api } from '@/lib/api'
import { useCurrencyFormatter } from '@/lib/use-currency-formatter'

interface CashflowData {
  nodes: { name: string }[]
  links: { source: number; target: number; value: number }[]
  totalIncome: number
}

function ReportsSkeleton() {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="p-5 sm:p-7">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 mb-6 sm:mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-xl p-5 sm:p-6">
              <div className="h-3 w-20 rounded bg-secondary animate-pulse" />
              <div className="mt-3 h-7 w-32 rounded bg-secondary animate-pulse sm:h-8" />
            </div>
          ))}
        </div>
        <div className="glass rounded-xl p-5 sm:p-7">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-5 w-48 rounded bg-secondary animate-pulse" />
            <div className="h-4 w-16 rounded bg-secondary animate-pulse" />
          </div>
          <div className="h-[200px] rounded-xl bg-secondary animate-pulse sm:h-[360px]" />
        </div>
        <div className="glass rounded-xl p-5 mt-3 sm:p-7 sm:mt-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-5 w-48 rounded bg-secondary animate-pulse" />
            <div className="h-4 w-16 rounded bg-secondary animate-pulse" />
          </div>
          <div className="h-[200px] rounded-xl bg-secondary animate-pulse sm:h-[300px]" />
        </div>
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const [cashflow, setCashflow] = useState<CashflowData | null>(null)
  const [loading, setLoading] = useState(true)
  const formatCurrency = useCurrencyFormatter()

  useEffect(() => {
    api.getCashflow().then((res) => {
      setCashflow(res)
      setLoading(false)
    })
  }, [])

  const totalIncome = cashflow?.totalIncome ?? 0
  const totalExpense = cashflow
    ? cashflow.links
        .filter((l) => l.target !== 0)
        .reduce((s, l) => s + l.value, 0)
    : 0
  const net = totalIncome - totalExpense
  const hasData = cashflow && cashflow.nodes.length > 0

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-5 sm:py-8 md:px-10 md:py-12">
      <PageHeader
        eyebrow="Reports"
        title="Cash Flow"
        description="See how money moves from your income sources into spending categories."
      />

      {loading ? (
        <ReportsSkeleton />
      ) : !hasData ? (
        <div className="glass rounded-xl p-12 text-center sm:p-16">
          <div className="flex flex-col items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary">
              <BarChart3 className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No cash flow data yet. Add some transactions to see your reports.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {[
              { label: 'Income', value: totalIncome, tone: 'text-success' },
              { label: 'Expenses', value: totalExpense, tone: 'text-foreground' },
              { label: 'Net Savings', value: net, tone: 'text-primary' },
            ].map((m) => (
              <div key={m.label} className="glass rounded-xl p-5 sm:p-6">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">
                  {m.label}
                </p>
                <p className={`mt-2 font-heading text-2xl sm:text-3xl ${m.tone}`}>
                  {formatCurrency(m.value)}
                </p>
              </div>
            ))}
          </div>

          <section className="glass rounded-xl p-5 sm:p-7">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-base text-foreground sm:text-lg">
                Income to Expense Flow
              </h3>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">
                All time
              </span>
            </div>
            <div className="-mx-2 overflow-x-auto sm:mx-0 sm:overflow-x-visible">
              <div className="min-w-[400px] sm:min-w-0">
                <CashflowSankey data={cashflow} />
              </div>
            </div>
          </section>

          <section className="glass rounded-xl p-5 sm:p-7">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-base text-foreground sm:text-lg">
                Income vs Expense
              </h3>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">
                6 months
              </span>
            </div>
            <div className="h-[200px] sm:h-[280px]">
              <IncomeExpenseChart />
            </div>
          </section>
        </>
      )}
    </div>
  )
}
