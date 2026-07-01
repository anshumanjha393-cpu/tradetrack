import { useEffect, useState } from 'react'
import {
  Landmark,
  PiggyBank,
  TrendingUp,
  Building2,
  DollarSign,
  Coins,
  CreditCard,
  Plus,
  Trash2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { api } from '@/lib/api'
import { useCurrencyFormatter } from '@/lib/use-currency-formatter'
import { useToast } from '@/components/ui/toast'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { AnimatedCard } from '@/components/ui/animated-card'
import { Button } from '@/components/ui/button'
import { Modal, FormField, ModalInput, ModalSelect } from '@/components/ui/modal'

interface Account {
  id: string
  name: string
  type: string
  balance: string
}

const iconMap: Record<string, LucideIcon> = {
  checking: Landmark,
  savings: PiggyBank,
  investment: TrendingUp,
  brokerage: TrendingUp,
  retirement: Building2,
  credit: CreditCard,
}

function AccountCard({ account, onDelete, formatCurrency }: { account: Account; onDelete?: () => void; formatCurrency: (n: number) => string }) {
  const Icon = iconMap[account.type] || Landmark
  const balance = parseFloat(account.balance)
  const isNegative = balance < 0

  return (
    <AnimatedCard className="glass rounded-xl p-5 transition-all duration-300 hover:border-primary/20 group relative overflow-hidden sm:p-6">
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary sm:h-12 sm:w-12">
              <Icon className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-foreground text-base sm:text-lg">{account.name}</h3>
              <p className="text-xs text-muted-foreground capitalize sm:text-sm">{account.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium sm:px-2.5 sm:text-xs ${isNegative ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
              {isNegative ? 'Liability' : 'Active'}
            </span>
            {onDelete && (
              <button onClick={onDelete} className="touch-target flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="mt-4 sm:mt-6">
          <p className="text-xs text-muted-foreground mb-1">Balance</p>
          <p className={`text-2xl font-heading font-semibold sm:text-3xl ${isNegative ? 'text-destructive' : 'text-foreground'}`}>{formatCurrency(balance)}</p>
        </div>
      </div>
    </AnimatedCard>
  )
}

function AccountCardSkeleton() {
  return (
    <div className="glass rounded-xl p-5 animate-pulse sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-2xl bg-secondary sm:h-12 sm:w-12" />
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-secondary" />
          <div className="h-3 w-20 rounded bg-secondary" />
        </div>
      </div>
      <div className="mt-4 space-y-2 sm:mt-6">
        <div className="h-3 w-16 rounded bg-secondary" />
        <div className="h-7 w-40 rounded bg-secondary sm:h-8" />
      </div>
    </div>
  )
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({ name: '', type: 'checking', balance: '' })
  const formatCurrencyRaw = useCurrencyFormatter()
  const formatCurrency = (amount: number) => formatCurrencyRaw(amount, { compact: false })
  const { toast } = useToast()

  const load = () => {
    api.getAccounts()
      .then((res) => {
        const list = Array.isArray(res) ? res : res.value ?? []
        setAccounts(list)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(a.balance), 0)
  const totalAssets = accounts.reduce((sum, a) => {
    const b = parseFloat(a.balance)
    return b > 0 ? sum + b : sum
  }, 0)
  const totalLiabilities = accounts.reduce((sum, a) => {
    const b = parseFloat(a.balance)
    return b < 0 ? sum + Math.abs(b) : sum
  }, 0)

  const validate = (): boolean => {
    const errors: Record<string, string> = {}
    if (!form.name.trim()) errors.name = 'Account name is required'
    if (!form.balance || isNaN(parseFloat(form.balance))) errors.balance = 'Valid balance is required'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAdd = async () => {
    if (!validate()) return
    setSubmitting(true)
    setFormError('')
    try {
      await api.createAccount({
        name: form.name.trim(),
        type: form.type,
        balance: parseFloat(form.balance),
      })
      toast('success', 'Account created successfully')
      setForm({ name: '', type: 'checking', balance: '' })
      setFieldErrors({})
      setShowModal(false)
      load()
    } catch (err: any) {
      setFormError(err.message || 'Failed to create account')
      toast('error', err.message || 'Failed to create account')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.deleteAccount(id)
      toast('success', 'Account deleted')
      load()
    } catch (err: any) {
      toast('error', err.message || 'Failed to delete account')
    }
  }

  const resetForm = () => {
    setForm({ name: '', type: 'checking', balance: '' })
    setFieldErrors({})
    setFormError('')
    setShowModal(false)
  }

  return (
    <>
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-5 sm:py-8 md:px-10 md:py-12">
        <PageHeader
          eyebrow="Accounts"
          title="Your Accounts"
          description="A comprehensive view of all your financial accounts in one place."
        />

        <section className="grid grid-cols-1 gap-3 mb-8 sm:gap-4 sm:mb-10 md:grid-cols-3">
          <StatCard icon={DollarSign} label="Total Balance">
            <p className="text-xl font-heading font-semibold text-foreground sm:text-2xl md:text-3xl">
              <AnimatedCounter value={totalBalance} format={(n) => formatCurrency(Math.round(n))} />
            </p>
            <p className="text-[10px] text-muted-foreground mt-1 sm:text-xs">Across all accounts</p>
          </StatCard>
          <StatCard icon={Coins} label="Total Assets">
            <p className="text-xl font-heading font-semibold text-success sm:text-2xl md:text-3xl">
              <AnimatedCounter value={totalAssets} format={(n) => formatCurrency(Math.round(n))} />
            </p>
            <p className="text-[10px] text-muted-foreground mt-1 sm:text-xs">Liquid & invested</p>
          </StatCard>
          <StatCard icon={CreditCard} label="Total Liabilities">
            <p className="text-xl font-heading font-semibold text-destructive sm:text-2xl md:text-3xl">
              <AnimatedCounter value={totalLiabilities} format={(n) => formatCurrency(Math.round(n))} />
            </p>
            <p className="text-[10px] text-muted-foreground mt-1 sm:text-xs">Outstanding debt</p>
          </StatCard>
        </section>

        <div className="flex justify-end mb-4">
          <Button size="sm" onClick={() => { setShowModal(true); setFormError(''); setFieldErrors({}) }} className="touch-target">
            <Plus className="size-4 mr-1" /> Add Account
          </Button>
        </div>

        <section>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">Account Details</h2>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {loading ? '...' : `${accounts.length} account${accounts.length === 1 ? '' : 's'}`}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <AccountCardSkeleton key={i} />
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center sm:p-16">
              <div className="flex flex-col items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary">
                  <Landmark className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No accounts yet</p>
                <Button size="sm" onClick={() => setShowModal(true)} className="touch-target">
                  <Plus className="size-3.5 mr-1" /> Add your first account
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
              {accounts.map((account) => (
                <AccountCard key={account.id} account={account} onDelete={() => handleDelete(account.id)} formatCurrency={formatCurrency} />
              ))}
            </div>
          )}
        </section>

        <footer className="mt-8 pt-6 border-t border-border sm:mt-12 sm:pt-8">
          <p className="text-xs text-muted-foreground text-center sm:text-sm">
            Account balances updated as of{' '}
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </footer>
      </div>

      <Modal
        open={showModal}
        onClose={resetForm}
        title="New Account"
        onSubmit={handleAdd}
        submitLabel="Create Account"
        loading={submitting}
        error={formError}
      >
        <div className="grid grid-cols-1 gap-4">
          <FormField label="Account Name" error={fieldErrors.name}>
            <ModalInput
              placeholder="e.g. Main Checking"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </FormField>
          <FormField label="Account Type">
            <ModalSelect value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="investment">Investment</option>
              <option value="brokerage">Brokerage</option>
              <option value="retirement">Retirement (401k)</option>
              <option value="credit">Credit Card</option>
            </ModalSelect>
          </FormField>
          <FormField label="Balance" error={fieldErrors.balance}>
            <ModalInput
              placeholder="Negative for liabilities (e.g. credit card debt)"
              type="number"
              step="any"
              value={form.balance}
              onChange={(e) => setForm({ ...form, balance: e.target.value })}
            />
          </FormField>
        </div>
      </Modal>
    </>
  )
}
