import { PageHeader } from '@/components/page-header'
import { TransactionsTable } from '@/components/transactions/transaction-table'

export default function TransactionsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-5 sm:py-8 md:px-10 md:py-12">
      <PageHeader
        eyebrow="Activity"
        title="Transactions"
        description="Search, filter, and review every movement across your accounts."
      />
      <TransactionsTable />
    </div>
  )
}
