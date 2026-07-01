
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { motion } from 'motion/react'
import { performance } from '@/lib/data'
import { useCurrencyFormatter } from '@/lib/use-currency-formatter'

export function PerformanceChart() {
  const formatCurrency = useCurrencyFormatter()

  return (
    <motion.div
      className="h-full w-full"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={performance} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>

          <defs>
            <linearGradient id="primaryFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="var(--border)"
            strokeDasharray="3 6"
          />
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
            cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '4 4' }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              return (
                <div className="rounded-xl border border-border bg-popover px-3 py-2 shadow-lg">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-heading text-base text-foreground">
                    {formatCurrency(Number(payload[0].value))}
                  </p>
                </div>
              )
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--primary)"
            strokeWidth={2.5}
            fill="url(#primaryFill)"
            dot={false}
            activeDot={{ r: 5, fill: 'var(--primary)', stroke: 'var(--background)', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

