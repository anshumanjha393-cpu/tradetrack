import { useEffect, useState } from 'react'
import {
  Home,
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Heart,
  Gamepad2,
  Wallet,
  TrendingDown,
  PiggyBank,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { AnimatedProgress } from '@/components/ui/animated-progress'
import { Button } from '@/components/ui/button'
import { Modal, FormField, ModalInput, ModalSelect } from '@/components/ui/modal'
import { api } from '@/lib/api'
import { useCurrencyFormatter } from '@/lib/use-currency-formatter'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

const iconMap: Record<string, LucideIcon> = {
  Housing: Home,
  Food: UtensilsCrossed,
  Transport: Car,
  Shopping: ShoppingBag,
  Health: Heart,
  Entertainment: Gamepad2,
  Utilities: PiggyBank,
  Income: Wallet,
  Investments: TrendingDown,
}

const budgetCategories = ['Housing', 'Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Utilities', 'Income', 'Investments']

interface ApiBudget {
  id: string
  monthlyLimit: string
  month: string
  category: { id: string; name: string }
}

interface ApiTransaction {
  id: string
  amount: string
  date: string
  categoryId: string | null
  category: { name: string; type: string } | null
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function SummaryCard({ title, value, icon, variant = 'default', formatCurrency }: {
  title: string; value: number; icon: LucideIcon; variant?: 'default' | 'warning' | 'danger'; formatCurrency: (n: number) => string
}) {
  const accent = variant === 'danger' ? 'destructive' : 'primary'
  return (
    <StatCard icon={icon} label={title} accent={accent}>
      <p className={`text-xl font-heading font-semibold sm:text-2xl md:text-3xl ${value < 0 ? 'text-destructive' : 'text-foreground'}`}>
        {value < 0 ? '-' : ''}
        <AnimatedCounter value={Math.abs(value)} format={formatCurrency} />
      </p>
    </StatCard>
  )
}

function MonthSelector({ selectedMonth, onSelectMonth }: {
  selectedMonth: number; onSelectMonth: (m: number) => void
}) {
  const getVisibleMonths = () => {
    const months = []
    for (let i = -1; i <= 1; i++) {
      let idx = selectedMonth + i
      if (idx < 0) idx += 12
      if (idx > 11) idx -= 12
      months.push(idx)
    }
    return months
  }

  return (
    <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8">
      <button
        onClick={() => onSelectMonth(selectedMonth === 0 ? 11 : selectedMonth - 1)}
        className="touch-target flex items-center justify-center rounded-lg bg-secondary p-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Previous month"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      <div className="flex items-center gap-1.5 overflow-x-auto px-1 sm:gap-2">
        {getVisibleMonths().map((idx) => (
          <button
            key={idx}
            onClick={() => onSelectMonth(idx)}
            className={cn(
              'touch-target whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-all duration-300 sm:px-4 sm:text-sm',
              idx === selectedMonth
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                : 'bg-secondary text-muted-foreground hover:text-foreground',
            )}
          >
            {MONTHS[idx]}
          </button>
        ))}
      </div>
      <button
        onClick={() => onSelectMonth(selectedMonth === 11 ? 0 : selectedMonth + 1)}
        className="touch-target flex items-center justify-center rounded-lg bg-secondary p-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Next month"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  )
}

function BudgetCard({ category, limit, spent, icon: Icon, onDelete, formatCurrency }: {
  category: string; limit: number; spent: number; icon: React.ElementType; onDelete?: () => void; formatCurrency: (n: number) => string
}) {
  const percentage = limit > 0 ? (spent / limit) * 100 : 0
  const remaining = limit - spent
  const isOverspent = spent > limit

  return (
    <div className={`glass rounded-xl p-5 transition-all duration-300 group relative overflow-hidden sm:p-6 ${isOverspent ? 'border-destructive/30 shadow-lg shadow-destructive/10' : 'hover:border-primary/20'}`}>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-2xl sm:h-11 sm:w-11 ${isOverspent ? 'bg-destructive/20' : 'bg-secondary'}`}>
              <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${isOverspent ? 'text-destructive' : 'text-primary'}`} />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-foreground text-base sm:text-lg">{category}</h3>
              <p className="text-xs text-muted-foreground sm:text-sm">
                {isOverspent ? (
                  <span className="text-destructive flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    Over budget by {formatCurrency(Math.abs(remaining))}
                  </span>
                ) : (
                  <>{formatCurrency(remaining)} remaining</>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOverspent && (
              <span className="inline-flex items-center rounded-full bg-destructive/20 px-2 py-0.5 text-[10px] font-medium text-destructive sm:px-2.5 sm:text-xs">Overspent</span>
            )}
            {onDelete && (
              <button onClick={onDelete} className="touch-target flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground mb-1 sm:text-xs">Spent</p>
              <p className={`text-lg font-semibold sm:text-xl ${isOverspent ? 'text-destructive' : 'text-foreground'}`}>{formatCurrency(spent)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground mb-1 sm:text-xs">Budget</p>
              <p className="text-lg font-semibold text-muted-foreground sm:text-xl">{formatCurrency(limit)}</p>
            </div>
          </div>
          <AnimatedProgress value={spent} max={limit} />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground sm:text-xs">{percentage.toFixed(0)}% used</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<ApiBudget[]>([])
  const [transactions, setTransactions] = useState<ApiTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({ category: '', monthlyLimit: '', month: '' })
  const formatCurrencyRaw = useCurrencyFormatter()
  const formatCurrency = (amount: number) => formatCurrencyRaw(amount, { compact: false })
  const { toast } = useToast()

  const load = () => {
    Promise.all([api.getBudgets(), api.getTransactions()])
      .then(([b, t]) => {
        setBudgets(Array.isArray(b) ? b : b.value ?? [])
        setTransactions(Array.isArray(t) ? t : t.value ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filteredBudgets = budgets.filter((b) => {
    const d = new Date(b.month)
    return d.getMonth() === selectedMonth
  })

  const spentByCategory: Record<string, number> = {}
  transactions.forEach((t) => {
    const d = new Date(t.date)
    if (d.getMonth() === selectedMonth && t.category?.type === 'expense') {
      const name = t.category.name
      spentByCategory[name] = (spentByCategory[name] || 0) + Math.abs(Number(t.amount))
    }
  })

  const totalBudgeted = filteredBudgets.reduce((s, b) => s + Number(b.monthlyLimit), 0)
  const totalSpent = filteredBudgets.reduce((s, b) => s + (spentByCategory[b.category.name] || 0), 0)
  const remaining = totalBudgeted - totalSpent

  const validate = (): boolean => {
    const errors: Record<string, string> = {}
    if (!form.category) errors.category = 'Category is required'
    if (!form.monthlyLimit || isNaN(parseFloat(form.monthlyLimit)) || parseFloat(form.monthlyLimit) <= 0) errors.monthlyLimit = 'Valid monthly limit is required'
    if (!form.month) errors.month = 'Month is required'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAdd = async () => {
    if (!validate()) return
    setSubmitting(true)
    setFormError('')
    try {
      await api.createBudget({
        categoryId: form.category,
        monthlyLimit: parseFloat(form.monthlyLimit),
        month: form.month,
      })
      toast('success', 'Budget created successfully')
      setForm({ category: '', monthlyLimit: '', month: '' })
      setFieldErrors({})
      setShowModal(false)
      load()
    } catch (err: any) {
      setFormError(err.message || 'Failed to create budget')
      toast('error', err.message || 'Failed to create budget')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.deleteBudget(id)
      toast('success', 'Budget deleted')
      load()
    } catch (err: any) {
      toast('error', err.message || 'Failed to delete budget')
    }
  }

  const resetForm = () => {
    setForm({ category: '', monthlyLimit: '', month: '' })
    setFieldErrors({})
    setFormError('')
    setShowModal(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 py-6 sm:py-8 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <PageHeader eyebrow="Budgets" title="Monthly Budgets" description="Track your spending across categories." />
          <div className="grid grid-cols-1 gap-3 mb-8 sm:gap-4 sm:mb-10 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass rounded-xl p-5 animate-pulse sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-9 rounded-2xl bg-secondary sm:size-10" />
                  <div className="h-3 w-20 rounded bg-secondary" />
                </div>
                <div className="h-7 w-32 rounded bg-secondary sm:h-8" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass rounded-xl p-5 animate-pulse sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-9 w-9 rounded-2xl bg-secondary sm:h-11 sm:w-11" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 rounded bg-secondary" />
                    <div className="h-3 w-32 rounded bg-secondary" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between"><div className="h-3 w-16 rounded bg-secondary" /><div className="h-3 w-20 rounded bg-secondary" /></div>
                  <div className="h-2 w-full rounded-full bg-secondary" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-5 sm:py-8 md:px-10 md:py-12">
        <PageHeader
          eyebrow="Budgets"
          title="Monthly Budgets"
          description="Track your spending across categories and stay on top of your financial goals."
        />

        <section className="grid grid-cols-1 gap-3 mb-8 sm:gap-4 sm:mb-10 md:grid-cols-3">
          <SummaryCard title="Total Budgeted" value={totalBudgeted} icon={Wallet} formatCurrency={formatCurrency} />
          <SummaryCard title="Total Spent" value={totalSpent} icon={TrendingDown} formatCurrency={formatCurrency} />
          <SummaryCard title="Remaining" value={remaining} icon={PiggyBank} variant={remaining < 0 ? 'danger' : remaining < totalBudgeted * 0.2 ? 'warning' : 'default'} formatCurrency={formatCurrency} />
        </section>

        <div className="flex justify-end mb-4">
          <Button size="sm" onClick={() => { setShowModal(true); setFormError(''); setFieldErrors({}) }} className="touch-target">
            <Plus className="size-4 mr-1" /> Add Budget
          </Button>
        </div>

        <MonthSelector selectedMonth={selectedMonth} onSelectMonth={setSelectedMonth} />

        <section>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">Budget Categories</h2>
            <p className="text-xs text-muted-foreground sm:text-sm">{filteredBudgets.length} categories</p>
          </div>

          {filteredBudgets.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center sm:p-16">
              <div className="flex flex-col items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary">
                  <Wallet className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No budgets for this month</p>
                <Button size="sm" onClick={() => setShowModal(true)} className="touch-target">
                  <Plus className="size-3.5 mr-1" /> Create a budget
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
              {filteredBudgets.map((b) => {
                const Icon = iconMap[b.category.name] || Wallet
                return (
                  <BudgetCard
                    key={b.id}
                    category={b.category.name}
                    icon={Icon}
                    limit={Number(b.monthlyLimit)}
                    spent={spentByCategory[b.category.name] || 0}
                    onDelete={() => handleDelete(b.id)}
                    formatCurrency={formatCurrency}
                  />
                )
              })}
            </div>
          )}
        </section>

        <section className="mt-8 glass rounded-xl p-5 sm:mt-10 sm:p-6">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-4 sm:text-xl">Quick Insights</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-success shrink-0" />
              <span className="text-muted-foreground">
                <span className="text-foreground font-medium">
                  {filteredBudgets.filter((b) => (spentByCategory[b.category.name] || 0) / Number(b.monthlyLimit) <= 0.8).length}
                </span> categories on track
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
              <span className="text-muted-foreground">
                <span className="text-foreground font-medium">
                  {filteredBudgets.filter((b) => { const r = (spentByCategory[b.category.name] || 0) / Number(b.monthlyLimit); return r > 0.8 && r <= 1 }).length}
                </span> categories with warning
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-destructive shrink-0" />
              <span className="text-muted-foreground">
                <span className="text-foreground font-medium">
                  {filteredBudgets.filter((b) => (spentByCategory[b.category.name] || 0) > Number(b.monthlyLimit)).length}
                </span> categories overspent
              </span>
            </div>
          </div>
        </section>

        <footer className="mt-8 pt-6 border-t border-border sm:mt-12 sm:pt-8">
          <p className="text-xs text-muted-foreground text-center sm:text-sm">
            Budget tracking for {MONTHS[selectedMonth]} {new Date().getFullYear()} &bull; Updated daily
          </p>
        </footer>
      </div>

      <Modal
        open={showModal}
        onClose={resetForm}
        title="New Budget"
        onSubmit={handleAdd}
        submitLabel="Create Budget"
        loading={submitting}
        error={formError}
      >
        <div className="grid grid-cols-1 gap-4">
          <FormField label="Category" error={fieldErrors.category}>
            <ModalSelect
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="">Select category</option>
              {budgetCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </ModalSelect>
          </FormField>
          <FormField label="Monthly Limit" error={fieldErrors.monthlyLimit}>
            <ModalInput
              placeholder="Budget amount"
              type="number"
              step="any"
              value={form.monthlyLimit}
              onChange={(e) => setForm({ ...form, monthlyLimit: e.target.value })}
            />
          </FormField>
          <FormField label="Month" error={fieldErrors.month}>
            <ModalInput
              type="month"
              value={form.month}
              onChange={(e) => setForm({ ...form, month: e.target.value })}
            />
          </FormField>
        </div>
      </Modal>
    </>
  )
}
