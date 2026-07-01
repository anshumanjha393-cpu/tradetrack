
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { incomeVsExpense } from '@/lib/data'
import { useCurrencyFormatter } from '@/lib/use-currency-formatter'

export function IncomeExpenseChart() {
  const formatCurrency = useCurrencyFormatter()

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={incomeVsExpense} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 6" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            dy={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={48}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            tickFormatter={(v) => formatCurrency(v, { compact: true })}
          />
          <Tooltip
            cursor={{ fill: 'var(--secondary)', opacity: 0.4 }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              return (
                <div className="rounded-xl border border-border bg-popover px-3 py-2 shadow-lg">
                  <p className="mb-1 text-xs text-muted-foreground">{label}</p>
                  {payload.map((p) => (
                    <p key={p.dataKey} className="text-sm capitalize text-foreground">
                      {p.dataKey}: {formatCurrency(Number(p.value))}
                    </p>
                  ))}
                </div>
              )
            }}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 12, color: 'var(--color-muted-foreground)' }}
          />
          <Bar dataKey="income" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={28} />
          <Bar dataKey="expense" fill="var(--chart-4)" radius={[6, 6, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
