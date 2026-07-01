import { useEffect, useState } from 'react'
import {
  Calendar,
  CheckCircle2,
  DollarSign,
  Home,
  Plane,
  Shield,
  Target,
  Trophy,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Trash2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/ui/stat-card'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { AnimatedProgress } from '@/components/ui/animated-progress'
import { Button } from '@/components/ui/button'
import { Modal, FormField, ModalInput } from '@/components/ui/modal'
import { api } from '@/lib/api'
import { useCurrencyFormatter } from '@/lib/use-currency-formatter'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

const iconMap: Record<string, LucideIcon> = {
  Shield, Home, Plane, TrendingUp, Target, DollarSign, Trophy,
}

const emojiOptions = [
  { emoji: '🛡️', label: 'Shield (Emergency)', value: 'Shield' },
  { emoji: '🏠', label: 'Home', value: 'Home' },
  { emoji: '✈️', label: 'Plane (Travel)', value: 'Plane' },
  { emoji: '📈', label: 'TrendingUp (Investment)', value: 'TrendingUp' },
  { emoji: '🎓', label: 'Education', value: 'Target' },
  { emoji: '💰', label: 'Savings', value: 'DollarSign' },
  { emoji: '🚗', label: 'Vehicle', value: 'Trophy' },
]

interface ApiGoal {
  id: string
  name: string
  targetAmount: string
  currentAmount: string
  targetDate: string
  icon: string | null
}

function calculateMonthlyContribution(current: number, target: number, targetDate: string): number {
  const now = new Date()
  const targetDateParsed = new Date(targetDate)
  const monthsRemaining = Math.max(1,
    (targetDateParsed.getFullYear() - now.getFullYear()) * 12 +
    (targetDateParsed.getMonth() - now.getMonth()),
  )
  return Math.ceil((target - current) / monthsRemaining)
}

function SummaryCard({ title, value, icon, subtitle, accent, format, formatCurrency }: {
  title: string; value: number; icon: LucideIcon; subtitle?: string; accent?: boolean; format?: (n: number) => string; formatCurrency: (n: number) => string
}) {
  return (
    <StatCard icon={icon} label={title} accent="primary">
      <p className={`text-xl font-heading font-semibold sm:text-2xl md:text-3xl ${accent ? 'text-primary' : 'text-foreground'}`}>
        <AnimatedCounter value={value} format={format ?? formatCurrency} />
      </p>
      {subtitle && <p className="text-[10px] text-muted-foreground mt-1 sm:text-xs">{subtitle}</p>}
    </StatCard>
  )
}

function CircularProgress({ percentage, size = 100, strokeWidth = 8 }: {
  percentage: number; size?: number; strokeWidth?: number
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255, 255, 255, 0.1)" strokeWidth={strokeWidth} fill="transparent" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="var(--primary)" strokeWidth={strokeWidth} fill="transparent"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-heading font-semibold text-foreground sm:text-2xl">{percentage}%</span>
      </div>
    </div>
  )
}

function GoalCard({ goal, onDelete, formatCurrency }: { goal: ApiGoal; onDelete?: () => void; formatCurrency: (n: number) => string }) {
  const current = Number(goal.currentAmount)
  const target = Number(goal.targetAmount)
  const percentage = target > 0 ? Math.round((current / target) * 100) : 0
  const monthlyContribution = calculateMonthlyContribution(current, target, goal.targetDate)
  const remaining = target - current
  const completed = percentage >= 100
  const Icon = iconMap[goal.icon || ''] || Target

  return (
    <div className={`glass rounded-xl p-5 transition-all duration-300 group relative overflow-hidden sm:p-6 ${completed ? 'border-primary/30' : 'hover:border-primary/20'}`}>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl sm:h-12 sm:w-12 ${completed ? 'bg-primary/20' : 'bg-secondary'}`}>
              <Icon className={`w-5 h-5 text-primary sm:w-6 sm:h-6`} />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-foreground text-base sm:text-lg">{goal.name}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <Calendar className="w-3 h-3 text-muted-foreground sm:w-3.5 sm:h-3.5" />
                <span className="text-[10px] text-muted-foreground sm:text-sm">
                  Target: {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {completed && (
              <div className="flex items-center gap-1.5 rounded-full bg-primary/20 px-2 py-0.5 sm:px-2.5 sm:py-1">
                <CheckCircle2 className="w-3 h-3 text-primary sm:w-4 sm:h-4" />
                <span className="text-[10px] font-semibold text-primary sm:text-xs">Complete</span>
              </div>
            )}
            {onDelete && (
              <button onClick={onDelete} className="touch-target flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-start gap-4 sm:items-center sm:gap-6">
          <CircularProgress percentage={percentage} size={80} />
          <div className="flex-1 space-y-3 sm:space-y-4">
            <div>
              <div className="flex items-end justify-between mb-1">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide sm:text-xs">Saved</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide sm:text-xs">Goal</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-base font-heading font-semibold text-foreground sm:text-xl">{formatCurrency(current)}</span>
                <span className="text-base font-heading font-semibold text-muted-foreground sm:text-xl">{formatCurrency(target)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5"><Target className="w-3 h-3 sm:w-4 sm:h-4" /> Remaining</span>
                <span className="text-foreground font-medium">{formatCurrency(remaining)}</span>
              </div>
              {!completed && monthlyContribution > 0 && (
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5"><ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" /> Monthly needed</span>
                  <span className="text-primary font-medium">{formatCurrency(monthlyContribution)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6">
          <AnimatedProgress value={current} max={target} />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-muted-foreground sm:text-xs">{percentage}% complete</span>
            <span className="text-[10px] text-muted-foreground sm:text-xs">{formatCurrency(target - current)} to go</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function GoalCardSkeleton() {
  return (
    <div className="glass rounded-xl p-5 animate-pulse sm:p-6">
      <div className="flex items-start justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-secondary sm:h-12 sm:w-12" />
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-secondary" />
            <div className="h-3 w-24 rounded bg-secondary" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="size-[80px] rounded-full bg-secondary sm:size-[120px]" />
        <div className="flex-1 space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between"><div className="h-2 w-12 rounded bg-secondary" /><div className="h-2 w-12 rounded bg-secondary" /></div>
            <div className="flex justify-between"><div className="h-4 w-24 rounded bg-secondary" /><div className="h-4 w-24 rounded bg-secondary" /></div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between"><div className="h-3 w-24 rounded bg-secondary" /><div className="h-3 w-16 rounded bg-secondary" /></div>
            <div className="flex justify-between"><div className="h-3 w-28 rounded bg-secondary" /><div className="h-3 w-20 rounded bg-secondary" /></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<ApiGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({ name: '', targetAmount: '', currentAmount: '', targetDate: '', icon: '' })
  const formatCurrencyRaw = useCurrencyFormatter()
  const formatCurrency = (amount: number) => formatCurrencyRaw(amount, { compact: false })
  const { toast } = useToast()

  const load = () => {
    api.getGoals()
      .then((res) => {
        setGoals(Array.isArray(res) ? res : res.value ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const totalSaved = goals.reduce((s, g) => s + Number(g.currentAmount), 0)
  const totalTarget = goals.reduce((s, g) => s + Number(g.targetAmount), 0)
  const onTrack = goals.filter((g) => Number(g.currentAmount) / Number(g.targetAmount) >= 0.5).length

  const validate = (): boolean => {
    const errors: Record<string, string> = {}
    if (!form.name.trim()) errors.name = 'Goal name is required'
    if (!form.targetAmount || isNaN(parseFloat(form.targetAmount)) || parseFloat(form.targetAmount) <= 0) errors.targetAmount = 'Valid target amount is required'
    if (!form.targetDate) errors.targetDate = 'Target date is required'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAdd = async () => {
    if (!validate()) return
    setSubmitting(true)
    setFormError('')
    try {
      await api.createGoal({
        name: form.name.trim(),
        targetAmount: parseFloat(form.targetAmount),
        currentAmount: parseFloat(form.currentAmount || '0'),
        targetDate: form.targetDate,
        icon: form.icon || undefined,
      })
      toast('success', 'Goal created successfully')
      setForm({ name: '', targetAmount: '', currentAmount: '', targetDate: '', icon: '' })
      setFieldErrors({})
      setShowModal(false)
      load()
    } catch (err: any) {
      setFormError(err.message || 'Failed to create goal')
      toast('error', err.message || 'Failed to create goal')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.deleteGoal(id)
      toast('success', 'Goal deleted')
      load()
    } catch (err: any) {
      toast('error', err.message || 'Failed to delete goal')
    }
  }

  const resetForm = () => {
    setForm({ name: '', targetAmount: '', currentAmount: '', targetDate: '', icon: '' })
    setFieldErrors({})
    setFormError('')
    setShowModal(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 py-6 sm:py-8 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <PageHeader eyebrow="Goals" title="Financial Goals" description="Track your progress toward life's big milestones." />
          <div className="grid grid-cols-1 gap-3 mb-8 sm:gap-4 sm:mb-10 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass rounded-xl p-5 animate-pulse sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-9 rounded-2xl bg-secondary sm:size-10" />
                  <div className="h-3 w-24 rounded bg-secondary" />
                </div>
                <div className="h-7 w-32 rounded bg-secondary sm:h-8" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <GoalCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
    <div className="min-h-screen bg-background px-4 py-6 sm:py-8 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          eyebrow="Goals"
          title="Financial Goals"
          description="Track your progress toward life's big milestones. Stay motivated and watch your dreams become reality."
        />

        <section className="grid grid-cols-1 gap-3 mb-8 sm:gap-4 sm:mb-10 md:grid-cols-3">
          <SummaryCard title="Goals On Track" value={onTrack} icon={Trophy} subtitle={`of ${goals.length} total goals`} accent format={(n) => String(Math.round(n))} formatCurrency={formatCurrency} />
          <SummaryCard title="Total Saved" value={totalSaved} icon={DollarSign} subtitle="Across all goals" formatCurrency={formatCurrency} />
          <SummaryCard title="Total Target" value={totalTarget} icon={Target} subtitle="Combined goal amount" formatCurrency={formatCurrency} />
        </section>

        <div className="flex justify-end mb-4">
          <Button size="sm" onClick={() => { setShowModal(true); setFormError(''); setFieldErrors({}) }} className="touch-target">
            <Plus className="size-4 mr-1" /> Add Goal
          </Button>
        </div>

        <section>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="font-heading text-xl font-semibold text-foreground sm:text-2xl">Your Goals</h2>
            <p className="text-xs text-muted-foreground sm:text-sm">{goals.length} active goals</p>
          </div>

          {goals.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center sm:p-16">
              <div className="flex flex-col items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary">
                  <Target className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No goals yet</p>
                <Button size="sm" onClick={() => setShowModal(true)} className="touch-target">
                  <Plus className="size-3.5 mr-1" /> Create your first goal
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
              {goals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} onDelete={() => handleDelete(goal.id)} formatCurrency={formatCurrency} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-8 glass rounded-xl p-5 sm:mt-10 sm:p-6">
          <h3 className="font-heading text-lg font-semibold text-foreground mb-4 sm:text-xl">Tips to Reach Your Goals Faster</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/20 mt-0.5 sm:h-8 sm:w-8">
                <span className="text-xs font-semibold text-primary sm:text-sm">1</span>
              </div>
              <p className="text-xs text-muted-foreground sm:text-sm">Set up <span className="text-foreground font-medium">automatic transfers</span> each payday to stay consistent</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/20 mt-0.5 sm:h-8 sm:w-8">
                <span className="text-xs font-semibold text-primary sm:text-sm">2</span>
              </div>
              <p className="text-xs text-muted-foreground sm:text-sm">Increase contributions by <span className="text-foreground font-medium">1-2%</span> whenever you get a raise</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/20 mt-0.5 sm:h-8 sm:w-8">
                <span className="text-xs font-semibold text-primary sm:text-sm">3</span>
              </div>
              <p className="text-xs text-muted-foreground sm:text-sm">Review and adjust your <span className="text-foreground font-medium">monthly budget</span> to find extra savings</p>
            </div>
          </div>
        </section>

        <footer className="mt-8 pt-6 border-t border-border sm:mt-12 sm:pt-8">
          <p className="text-xs text-muted-foreground text-center sm:text-sm">
            Goal progress updates in real-time as you save &bull; Last sync: Just now
          </p>
        </footer>
      </div>

      <Modal
        open={showModal}
        onClose={resetForm}
        title="New Goal"
        onSubmit={handleAdd}
        submitLabel="Create Goal"
        loading={submitting}
        error={formError}
        maxWidth="max-w-xl"
      >
        <div className="grid grid-cols-1 gap-4">
          <FormField label="Goal Name" error={fieldErrors.name}>
            <ModalInput
              placeholder="e.g. Emergency Fund"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </FormField>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Target Amount" error={fieldErrors.targetAmount}>
              <ModalInput
                placeholder="0.00"
                type="number"
                step="any"
                value={form.targetAmount}
                onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
              />
            </FormField>
            <FormField label="Current Amount">
              <ModalInput
                placeholder="0.00"
                type="number"
                step="any"
                value={form.currentAmount}
                onChange={(e) => setForm({ ...form, currentAmount: e.target.value })}
              />
            </FormField>
          </div>
          <FormField label="Target Date" error={fieldErrors.targetDate}>
            <ModalInput
              type="date"
              value={form.targetDate}
              onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
            />
          </FormField>
          <FormField label="Icon">
            <div className="flex flex-wrap gap-2">
              {emojiOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, icon: form.icon === opt.value ? '' : opt.value })}
                  className={cn(
                    'touch-target flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors',
                    form.icon === opt.value
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:border-border',
                  )}
                >
                  <span className="text-lg">{opt.emoji}</span>
                  <span className="hidden sm:inline">{opt.label.split(' (')[0]}</span>
                </button>
              ))}
            </div>
          </FormField>
        </div>
      </Modal>
      </div>
    </>
  )
}
