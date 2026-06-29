import { TrendingUp, ArrowUpRight, ArrowDownRight, Wifi, WifiOff, Clock } from 'lucide-react'
import { useCurrencyFormatter } from '@/lib/use-currency-formatter'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export interface Holding {
  id: string
  ticker: string
  quantity: string
  costBasis: string
  lastPrice: string
  lastFetched: string | null
  priceSource?: 'live' | 'cached' | 'error'
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Never'
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function PriceBadge({ source }: { source: 'live' | 'cached' | 'error' | undefined }) {
  if (source === 'live') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-success sm:px-2 sm:text-[10px]">
        <Wifi className="size-2 sm:size-2.5" />
        Live
      </span>
    )
  }
  if (source === 'error') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-destructive sm:px-2 sm:text-[10px]">
        <WifiOff className="size-2 sm:size-2.5" />
        Error
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-500 sm:px-2 sm:text-[10px]">
      <Clock className="size-2 sm:size-2.5" />
      Cached
    </span>
  )
}

function PriceDirection({ current, cost }: { current: number; cost: number }) {
  const diff = current - cost
  const pct = cost > 0 ? (diff / cost) * 100 : 0
  const up = diff >= 0

  return (
    <span className={cn('inline-flex items-center gap-0.5 text-[10px] font-medium tabular-nums sm:text-xs', up ? 'text-success' : 'text-destructive')}>
      {up ? <ArrowUpRight className="size-2.5 sm:size-3" /> : <ArrowDownRight className="size-2.5 sm:size-3" />}
      {up ? '+' : ''}{pct.toFixed(1)}%
    </span>
  )
}

function HoldingRowSkeleton() {
  return (
    <tr className="border-t border-border">
      <td className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-secondary animate-pulse sm:size-9" />
          <div className="space-y-1.5">
            <div className="h-4 w-14 rounded bg-secondary animate-pulse" />
            <div className="h-3 w-20 rounded bg-secondary animate-pulse" />
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-right sm:px-4 sm:py-4"><div className="ml-auto h-4 w-10 rounded bg-secondary animate-pulse" /></td>
      <td className="hidden px-4 py-4 text-right md:table-cell"><div className="ml-auto h-4 w-20 rounded bg-secondary animate-pulse" /></td>
      <td className="px-3 py-3 text-right sm:px-4 sm:py-4">
        <div className="flex flex-col items-end gap-1.5">
          <div className="h-4 w-16 rounded bg-secondary animate-pulse sm:w-20" />
          <div className="h-3.5 w-10 rounded bg-secondary animate-pulse sm:w-12" />
        </div>
      </td>
      <td className="hidden px-4 py-4 text-right sm:table-cell"><div className="ml-auto h-4 w-20 rounded bg-secondary animate-pulse" /></td>
      <td className="px-3 py-3 text-right sm:px-6 sm:py-4">
        <div className="flex flex-col items-end gap-1.5">
          <div className="h-4 w-16 rounded bg-secondary animate-pulse sm:w-20" />
          <div className="h-3 w-10 rounded bg-secondary animate-pulse sm:w-12" />
        </div>
      </td>
      <td className="px-3 py-3 text-right sm:px-4 sm:py-4"><div className="ml-auto h-4 w-14 rounded bg-secondary animate-pulse sm:w-16" /></td>
    </tr>
  )
}

export function HoldingsTable({
  holdings,
  loading,
  onDelete,
}: {
  holdings: Holding[]
  loading: boolean
  onDelete?: (id: string) => void
}) {
  const formatCurrency = useCurrencyFormatter()

  if (loading) {
    return (
      <section className="glass overflow-hidden rounded-xl">
        <div className="border-b border-border px-5 py-4 sm:px-7 sm:py-5">
          <h3 className="font-heading text-base text-foreground sm:text-lg">Holdings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-sm sm:min-w-[780px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">
                <th className="px-4 py-2.5 font-medium sm:px-6 sm:py-3">Ticker</th>
                <th className="px-3 py-2.5 text-right font-medium sm:px-4 sm:py-3">Qty</th>
                <th className="hidden px-4 py-2.5 text-right font-medium md:table-cell sm:py-3">Avg Cost</th>
                <th className="px-3 py-2.5 text-right font-medium sm:px-4 sm:py-3">Price</th>
                <th className="hidden px-4 py-2.5 text-right font-medium sm:table-cell sm:py-3">Value</th>
                <th className="px-3 py-2.5 text-right font-medium sm:px-6 sm:py-3">P&amp;L</th>
                <th className="px-3 py-2.5 text-right font-medium sm:px-4 sm:py-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(4)].map((_, i) => (
                <HoldingRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    )
  }

  if (holdings.length === 0) {
    return (
      <section className="glass overflow-hidden rounded-xl">
        <div className="border-b border-border px-5 py-4 sm:px-7 sm:py-5">
          <h3 className="font-heading text-base text-foreground sm:text-lg">Holdings</h3>
        </div>
        <div className="flex flex-col items-center gap-3 p-12 text-center sm:p-16">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary">
            <TrendingUp className="size-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground sm:text-sm">No holdings yet. Add your first position above.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="glass overflow-hidden rounded-xl">
      <div className="border-b border-border px-5 py-4 sm:px-7 sm:py-5">
        <h3 className="font-heading text-base text-foreground sm:text-lg">Holdings</h3>
      </div>

      {/* Desktop table */}
      <div className="overflow-x-auto">
        <table className="hidden w-full min-w-[780px] text-sm md:table">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-6 py-3 font-medium">Ticker</th>
              <th className="px-4 py-3 text-right font-medium">Qty</th>
              <th className="px-4 py-3 text-right font-medium">Avg Cost</th>
              <th className="px-4 py-3 text-right font-medium">Price</th>
              <th className="px-4 py-3 text-right font-medium">Value</th>
              <th className="px-6 py-3 text-right font-medium">P&amp;L</th>
              <th className="px-4 py-3 text-right font-medium">Updated</th>
              {onDelete && <th className="px-4 py-3 font-medium" />}
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) => {
              const qty = Number(h.quantity)
              const avgCost = Number(h.costBasis)
              const price = Number(h.lastPrice)
              const value = qty * price
              const cost = qty * avgCost
              const pl = value - cost
              const plPct = cost > 0 ? (pl / cost) * 100 : 0
              const gain = pl >= 0

              return (
                <tr
                  key={h.id}
                  className="border-t border-border transition-colors hover:bg-secondary/40"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary font-heading text-xs font-bold text-foreground">
                        {h.ticker.slice(0, 3)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{h.ticker}</p>
                        <PriceBadge source={h.priceSource} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right tabular-nums text-muted-foreground">
                    {qty}
                  </td>
                  <td className="px-4 py-4 text-right tabular-nums text-muted-foreground">
                    {formatCurrency(avgCost)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className="tabular-nums text-foreground font-medium">
                        {formatCurrency(price)}
                      </span>
                      <PriceDirection current={price} cost={avgCost} />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right tabular-nums text-foreground">
                    {formatCurrency(value, { compact: true })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={cn(
                          'tabular-nums font-medium',
                          gain ? 'text-success' : 'text-destructive',
                        )}
                      >
                        {formatCurrency(pl, { sign: gain })}
                      </span>
                      <span
                        className={cn(
                          'text-xs tabular-nums',
                          gain ? 'text-success/70' : 'text-destructive/70',
                        )}
                      >
                        {gain ? '+' : ''}{plPct.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {formatRelativeTime(h.lastFetched)}
                    </span>
                  </td>
                  {onDelete && (
                    <td className="px-4 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onDelete(h.id)}
                        className="touch-target text-muted-foreground hover:text-destructive"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </Button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card layout */}
      <div className="md:hidden">
        {holdings.map((h) => {
          const qty = Number(h.quantity)
          const avgCost = Number(h.costBasis)
          const price = Number(h.lastPrice)
          const value = qty * price
          const cost = qty * avgCost
          const pl = value - cost
          const plPct = cost > 0 ? (pl / cost) * 100 : 0
          const gain = pl >= 0

          return (
            <div key={h.id} className="border-t border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary font-heading text-xs font-bold text-foreground">
                    {h.ticker.slice(0, 3)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{h.ticker}</p>
                    <PriceBadge source={h.priceSource} />
                  </div>
                </div>
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onDelete(h.id)}
                    className="touch-target text-muted-foreground hover:text-destructive"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </Button>
                )}
              </div>
              <div className="ml-12 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Qty</span>
                  <p className="tabular-nums text-foreground font-medium">{qty}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Price</span>
                  <div className="flex items-center gap-1.5">
                    <p className="tabular-nums text-foreground font-medium">{formatCurrency(price)}</p>
                    <PriceDirection current={price} cost={avgCost} />
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Value</span>
                  <p className="tabular-nums text-foreground">{formatCurrency(value, { compact: true })}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">P&L</span>
                  <p className={cn('tabular-nums font-medium', gain ? 'text-success' : 'text-destructive')}>
                    {formatCurrency(pl, { sign: gain })} <span className="text-[10px]">({gain ? '+' : ''}{plPct.toFixed(1)}%)</span>
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Updated </span>
                  <span className="text-muted-foreground tabular-nums">{formatRelativeTime(h.lastFetched)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
