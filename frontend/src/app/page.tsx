import { PageHeader } from '@/components/page-header'
import { NetWorthCard } from '@/components/dashboard/net-worth-card'
import { StatCards } from '@/components/dashboard/stat-cards'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { BudgetStatus } from '@/components/dashboard/budget-status'
import { useAuth } from '@/lib/auth-context'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-5 sm:py-8 md:px-10 md:py-12">
      <PageHeader
        eyebrow="Overview"
        title={`${getGreeting()}, ${firstName}`}
        description="Here is a calm, complete view of your wealth as of today."
      />
      <NetWorthCard />
      <StatCards />
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentTransactions />
        <BudgetStatus />
      </div>
    </div>
  )
}
