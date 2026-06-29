import { useEffect, useState, useCallback } from 'react'
import { ArrowUpRight, Plus, RefreshCw, AlertTriangle } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { HoldingsTable, type Holding } from '@/components/portfolio/holdings-table'
import { api } from '@/lib/api'
import { useCurrencyFormatter } from '@/lib/use-currency-formatter'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Modal, FormField, ModalInput } from '@/components/ui/modal'

interface PriceSummary {
  fetched: number
  cached: number
  failed: number
}

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [priceSummary, setPriceSummary] = useState<PriceSummary | null>(null)
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({ ticker: '', quantity: '', costBasis: '', lastPrice: '' })
  const formatCurrency = useCurrencyFormatter()
  const { toast } = useToast()

  const load = useCallback(() => {
    api.getHoldings()
      .then((res) => {
        const list = Array.isArray(res) ? res : res.value ?? []
        setHoldings(list.map((h: any) => ({
          ...h,
          lastFetched: h.lastFetched ?? null,
          priceSource: 'cached' as const,
        })))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (holdings.length === 0 || loading) return

    const allStale = holdings.every((h) => {
      if (!h.lastFetched) return true
      return Date.now() - new Date(h.lastFetched).getTime() > 60 * 60 * 1000
    })

    if (allStale) {
      handleRefreshPrices()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holdings, loading])

  const totalValue = holdings.reduce((s, h) => s + Number(h.quantity) * Number(h.lastPrice), 0)
  const totalCost = holdings.reduce((s, h) => s + Number(h.quantity) * Number(h.costBasis), 0)
  const totalPL = totalValue - totalCost
  const totalPLPct = totalCost > 0 ? (totalPL / totalCost) * 100 : 0
  const gainers = holdings.filter((h) => Number(h.lastPrice) >= Number(h.costBasis)).length

  const validate = (): boolean => {
    const errors: Record<string, string> = {}
    if (!form.ticker.trim()) errors.ticker = 'Ticker symbol is required'
    if (!form.quantity || isNaN(parseFloat(form.quantity)) || parseFloat(form.quantity) <= 0) errors.quantity = 'Valid quantity is required'
    if (!form.costBasis || isNaN(parseFloat(form.costBasis)) || parseFloat(form.costBasis) <= 0) errors.costBasis = 'Valid cost basis is required'
    if (!form.lastPrice || isNaN(parseFloat(form.lastPrice)) || parseFloat(form.lastPrice) <= 0) errors.lastPrice = 'Valid price is required'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAdd = async () => {
    if (!validate()) return
    setSubmitting(true)
    setFormError('')
    try {
      await api.createHolding({
        ticker: form.ticker.toUpperCase().trim(),
        quantity: parseFloat(form.quantity),
        costBasis: parseFloat(form.costBasis),
        lastPrice: parseFloat(form.lastPrice),
      })
      toast('success', 'Holding added successfully')
      setForm({ ticker: '', quantity: '', costBasis: '', lastPrice: '' })
      setFieldErrors({})
      setShowModal(false)
      load()
    } catch (err: any) {
      setFormError(err.message || 'Failed to add holding')
      toast('error', err.message || 'Failed to add holding')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.deleteHolding(id)
      toast('success', 'Holding deleted')
      load()
    } catch (err: any) {
      toast('error', err.message || 'Failed to delete holding')
    }
  }

  const handleRefreshPrices = async () => {
    setRefreshing(true)
    setPriceSummary(null)
    try {
      const result = await api.refreshPrices()
      const summary = result.summary as PriceSummary | undefined

      if (summary) {
        setPriceSummary(summary)
        if (summary.failed > 0 && summary.fetched === 0) {
          toast('error', `Failed to fetch prices for ${summary.failed} ticker${summary.failed > 1 ? 's' : ''}. Showing cached prices.`)
        } else if (summary.failed > 0) {
          toast('error', `Updated ${summary.fetched}, but ${summary.failed} failed. Using cached prices.`)
        } else if (summary.fetched > 0) {
          toast('success', `Prices updated for ${summary.fetched} holding${summary.fetched > 1 ? 's' : ''}`)
        } else {
          toast('success', 'All prices are up to date')
        }
      } else {
        toast('success', 'Prices refreshed')
      }

      const holdingsData = result.holdings ?? result
      if (Array.isArray(holdingsData)) {
        setHoldings(holdingsData.map((h: any) => ({
          ...h,
          lastFetched: h.lastFetched ?? null,
          priceSource: h.priceSource ?? 'cached' as const,
        })))
      } else {
        load()
      }
    } catch (err: any) {
      toast('error', err.message || 'Failed to refresh prices')
    } finally {
      setRefreshing(false)
    }
  }

  const resetForm = () => {
    setForm({ ticker: '', quantity: '', costBasis: '', lastPrice: '' })
    setFieldErrors({})
    setFormError('')
    setShowModal(false)
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-5 sm:py-8 md:px-10 md:py-12">
      <PageHeader
        eyebrow="Portfolio"
        title="Holdings"
        description="A detailed breakdown of your equity positions and unrealized gains."
      />

      <section className="glass rounded-xl p-5 sm:p-7 md:p-9">
        <div className="flex flex-col gap-5 sm:gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:text-sm">
              Total Portfolio Value
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 sm:gap-4">
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-5xl">
                {loading ? '...' : formatCurrency(totalValue)}
              </h2>
              {totalCost > 0 && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium sm:text-sm ${totalPL >= 0 ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}`}>
                  <ArrowUpRight className="size-3 sm:size-4" />
                  {totalPLPct.toFixed(1)}%
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="outline" size="sm" onClick={handleRefreshPrices} disabled={refreshing} className="touch-target">
              <RefreshCw className={`size-3.5 mr-1 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button size="sm" onClick={() => { setShowModal(true); setFormError(''); setFieldErrors({}) }} className="touch-target">
              <Plus className="size-4 mr-1" /> Add Holding
            </Button>
          </div>
          <dl className="grid grid-cols-3 gap-x-4 gap-y-3 sm:gap-x-10 sm:gap-y-4">
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">
                Unrealized P&amp;L
              </dt>
              <dd className={`mt-1 font-heading text-base sm:text-xl ${totalPL >= 0 ? 'text-success' : 'text-destructive'}`}>
                {loading ? '...' : formatCurrency(totalPL, { sign: true })}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">
                Cost Basis
              </dt>
              <dd className="mt-1 font-heading text-base text-foreground sm:text-xl">
                {loading ? '...' : formatCurrency(totalCost, { compact: true })}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">
                Positions
              </dt>
              <dd className="mt-1 font-heading text-base text-foreground sm:text-xl">
                {holdings.length}{' '}
                {gainers > 0 && <span className="text-xs text-success">({gainers} up)</span>}
              </dd>
            </div>
          </dl>
        </div>

        {priceSummary && priceSummary.failed > 0 && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-500 sm:px-4 sm:py-3 sm:text-sm">
            <AlertTriangle className="size-3.5 shrink-0 sm:size-4" />
            <span>
              {priceSummary.failed} price{priceSummary.failed > 1 ? 's' : ''} failed to update. Showing cached values.
            </span>
          </div>
        )}
      </section>

      <HoldingsTable holdings={holdings} loading={loading} onDelete={handleDelete} />

      <Modal
        open={showModal}
        onClose={resetForm}
        title="Add Holding"
        onSubmit={handleAdd}
        submitLabel="Add Holding"
        loading={submitting}
        error={formError}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Ticker Symbol" error={fieldErrors.ticker}>
            <ModalInput
              placeholder="e.g. AAPL"
              value={form.ticker}
              onChange={(e) => setForm({ ...form, ticker: e.target.value.toUpperCase() })}
            />
          </FormField>
          <FormField label="Quantity" error={fieldErrors.quantity}>
            <ModalInput
              placeholder="Number of shares"
              type="number"
              step="any"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </FormField>
          <FormField label="Average Cost per Share" error={fieldErrors.costBasis}>
            <ModalInput
              placeholder="$ per share"
              type="number"
              step="any"
              value={form.costBasis}
              onChange={(e) => setForm({ ...form, costBasis: e.target.value })}
            />
          </FormField>
          <FormField label="Current Price" error={fieldErrors.lastPrice}>
            <ModalInput
              placeholder="$ per share"
              type="number"
              step="any"
              value={form.lastPrice}
              onChange={(e) => setForm({ ...form, lastPrice: e.target.value })}
            />
          </FormField>
        </div>
      </Modal>
    </div>
  )
}
