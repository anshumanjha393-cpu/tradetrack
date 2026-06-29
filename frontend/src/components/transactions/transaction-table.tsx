import { useEffect, useMemo, useState } from 'react'
import { Search, Plus, Trash2, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { motion } from 'motion/react'

import { api } from '@/lib/api'
import { useCurrencyFormatter } from '@/lib/use-currency-formatter'
import { useToast } from '@/components/ui/toast'
import { CategoryIcon } from '@/components/category-icon'
import { Button } from '@/components/ui/button'
import { Modal, FormField, ModalInput, ModalSelect } from '@/components/ui/modal'
import { cn } from '@/lib/utils'

const categories = [
  'All',
  'Income',
  'Housing',
  'Food',
  'Transport',
  'Shopping',
  'Investments',
  'Health',
  'Entertainment',
  'Utilities',
] as const

const categoryOptions = categories.filter((c) => c !== 'All')

const ranges = [
  { label: 'All time', value: 'all' },
  { label: '7 days', value: '7' },
  { label: '14 days', value: '14' },
] as const

interface Transaction {
  id: string
  name: string
  category: string
  amount: number
  date: string
  accountId: string
}

interface Account {
  id: string
  name: string
}

export function TransactionsTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<(typeof categories)[number]>('All')
  const [range, setRange] = useState<(typeof ranges)[number]['value']>('all')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({ accountId: '', description: '', amount: '', date: '', categoryId: '' })
  const formatCurrency = useCurrencyFormatter()
  const { toast } = useToast()

  const load = () => {
    Promise.all([api.getTransactions(), api.getAccounts()])
      .then(([t, a]) => {
        const list = Array.isArray(t) ? t : t.value ?? []
        setTransactions(
          list.map((tx: any) => ({
            id: tx.id,
            name: tx.description,
            category: tx.category?.name ?? 'Uncategorized',
            amount: parseFloat(tx.amount),
            date: tx.date,
            accountId: tx.accountId,
          })),
        )
        setAccounts(Array.isArray(a) ? a : a.value ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const now = new Date()
    return [...transactions]
      .reverse()
      .filter((t) => {
        if (category !== 'All' && t.category !== category) return false
        if (query && !t.name.toLowerCase().includes(query.toLowerCase())) return false
        if (range !== 'all') {
          const days = Number(range)
          const diff = (now.getTime() - new Date(t.date).getTime()) / 86_400_000
          if (diff > days) return false
        }
        return true
      })
  }, [transactions, query, category, range])

  const total = filtered.reduce((s, t) => s + t.amount, 0)

  const validate = (): boolean => {
    const errors: Record<string, string> = {}
    if (!form.accountId) errors.accountId = 'Account is required'
    if (!form.description.trim()) errors.description = 'Description is required'
    if (!form.amount || isNaN(parseFloat(form.amount))) errors.amount = 'Valid amount is required'
    if (!form.date) errors.date = 'Date is required'
    if (!form.categoryId) errors.categoryId = 'Category is required'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAdd = async () => {
    if (!validate()) return
    setSubmitting(true)
    setFormError('')
    try {
      await api.createTransaction({
        accountId: form.accountId,
        description: form.description.trim(),
        amount: parseFloat(form.amount),
        date: form.date,
        categoryId: form.categoryId || undefined,
      })
      toast('success', 'Transaction added successfully')
      resetForm()
      load()
    } catch (err: any) {
      setFormError(err.message || 'Failed to add transaction')
      toast('error', err.message || 'Failed to add transaction')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.deleteTransaction(id)
      toast('success', 'Transaction deleted')
      load()
    } catch (err: any) {
      toast('error', err.message || 'Failed to delete transaction')
    }
  }

  const resetForm = () => {
    setForm({ accountId: '', description: '', amount: '', date: '', categoryId: '' })
    setFieldErrors({})
    setFormError('')
    setShowModal(false)
  }

  if (loading) {
    return (
      <section className="glass overflow-hidden rounded-xl">
        <div className="p-4 sm:p-6">
          <div className="flex gap-3 mb-4 sm:gap-4 sm:mb-6">
            <div className="h-10 flex-1 rounded-2xl bg-secondary animate-pulse lg:max-w-xs" />
            <div className="ml-auto flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 w-16 rounded-full bg-secondary animate-pulse sm:w-20" />
              ))}
            </div>
          </div>
          <div className="mb-4 flex gap-2 overflow-hidden sm:mb-6 sm:flex-wrap">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-7 w-14 shrink-0 rounded-full bg-secondary animate-pulse sm:w-16" />
            ))}
          </div>
          <div className="space-y-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
                <div className="size-8 rounded-xl bg-secondary animate-pulse sm:size-9" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-32 rounded bg-secondary animate-pulse sm:w-40" />
                  <div className="h-2.5 w-20 rounded bg-secondary animate-pulse sm:w-24" />
                </div>
                <div className="h-3.5 w-16 rounded bg-secondary animate-pulse sm:w-20" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="glass overflow-hidden rounded-xl">
      {/* Search + Range + Add */}
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transactions"
            aria-label="Search transactions"
            className="w-full rounded-2xl border border-border bg-secondary/50 py-2.5 pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          {ranges.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRange(r.value)}
              className={cn(
                'touch-target rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                range === r.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground',
              )}
            >
              {r.label}
            </button>
          ))}
          <Button size="sm" onClick={() => { setShowModal(true); setFormError(''); setFieldErrors({}) }} className="touch-target hidden sm:flex">
            <Plus className="size-3.5 mr-1" /> Add
          </Button>
        </div>
      </div>

      {/* Category filter pills - horizontally scrollable on mobile */}
      <div className="flex gap-2 overflow-x-auto border-b border-border p-3 scrollbar-none sm:flex-wrap sm:p-4">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={cn(
              'shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              category === c
                ? 'border-primary bg-primary/15 text-primary'
                : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Desktop table */}
      <div className="overflow-x-auto">
        <table className="hidden w-full min-w-[560px] text-sm md:table">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-6 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-6 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, index) => {
              const income = t.amount > 0
              return (
                <motion.tr
                  key={t.id}
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ duration: 0.35, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  className="border-t border-border transition-colors hover:bg-secondary/40"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                        <CategoryIcon category={t.category as any} className="size-4" />
                      </span>
                      <div>
                        <span className="block font-medium text-foreground">{t.name}</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          {income ? <ArrowDownLeft className="size-3 text-success" /> : <ArrowUpRight className="size-3 text-destructive" />}
                          {income ? 'Income' : 'Expense'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">{t.category}</span>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className={cn('px-6 py-4 text-right font-medium tabular-nums', income ? 'text-success' : 'text-foreground')}>
                    {income ? formatCurrency(t.amount, { sign: true }) : formatCurrency(t.amount)}
                  </td>
                  <td className="px-4 py-4">
                    <button onClick={() => handleDelete(t.id)} className="touch-target flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="size-3.5" />
                    </button>
                  </td>
                </motion.tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center sm:py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary">
                      <Search className="size-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">No transactions found</p>
                    <Button size="sm" onClick={() => setShowModal(true)} className="touch-target">
                      <Plus className="size-3.5 mr-1" /> Add your first transaction
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card layout */}
      <div className="md:hidden">
        {filtered.map((t, index) => {
          const income = t.amount > 0
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.35, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className="border-t border-border p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                    <CategoryIcon category={t.category as any} className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <span className="block truncate font-medium text-foreground text-sm">{t.name}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      {income ? <ArrowDownLeft className="size-3 text-success" /> : <ArrowUpRight className="size-3 text-destructive" />}
                      {income ? 'Income' : 'Expense'} · {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className={cn('text-sm font-medium tabular-nums', income ? 'text-success' : 'text-foreground')}>
                    {income ? formatCurrency(t.amount, { sign: true }) : formatCurrency(t.amount)}
                  </span>
                  <button onClick={() => handleDelete(t.id)} className="touch-target flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
              <div className="mt-2 ml-12">
                <span className="rounded-full border border-border px-2.5 py-1 text-[10px] text-muted-foreground">{t.category}</span>
              </div>
            </motion.div>
          )
        })}
        {filtered.length === 0 && (
          <div className="px-6 py-12 text-center sm:py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary">
                <Search className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No transactions found</p>
              <Button size="sm" onClick={() => setShowModal(true)} className="touch-target">
                <Plus className="size-3.5 mr-1" /> Add your first transaction
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs sm:px-6 sm:py-4 sm:text-sm">
        <span className="text-muted-foreground">{filtered.length} transaction{filtered.length === 1 ? '' : 's'}</span>
        <span className="text-muted-foreground">
          Net:{' '}
          <span className={cn('font-medium tabular-nums', total >= 0 ? 'text-success' : 'text-destructive')}>
            {formatCurrency(total, { sign: total >= 0 })}
          </span>
        </span>
      </div>

      {/* Mobile FAB */}
      <button
        type="button"
        onClick={() => { setShowModal(true); setFormError(''); setFieldErrors({}) }}
        className="fixed bottom-6 right-6 z-30 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95 md:hidden"
        aria-label="Add transaction"
      >
        <Plus className="size-6" />
      </button>

      <Modal
        open={showModal}
        onClose={resetForm}
        title="New Transaction"
        onSubmit={handleAdd}
        submitLabel="Add Transaction"
        loading={submitting}
        error={formError}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Account" error={fieldErrors.accountId}>
            <ModalSelect
              value={form.accountId}
              onChange={(e) => setForm({ ...form, accountId: e.target.value })}
            >
              <option value="">Select account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </ModalSelect>
          </FormField>
          <FormField label="Category" error={fieldErrors.categoryId}>
            <ModalSelect
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">Select category</option>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </ModalSelect>
          </FormField>
          <FormField label="Description" error={fieldErrors.description}>
            <ModalInput
              placeholder="e.g. Grocery shopping"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </FormField>
          <FormField label="Amount" error={fieldErrors.amount}>
            <ModalInput
              placeholder="Negative = expense, positive = income"
              type="number"
              step="any"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </FormField>
          <FormField label="Date" error={fieldErrors.date} >
            <ModalInput
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </FormField>
        </div>
      </Modal>
    </section>
  )
}
