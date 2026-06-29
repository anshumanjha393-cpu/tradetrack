import { useCurrency } from '@/lib/currency-context'
import { formatCurrency } from '@/lib/data'

export function useCurrencyFormatter() {
  const { symbol } = useCurrency()

  const format = (value: number, opts?: { compact?: boolean; sign?: boolean }) => {
    return formatCurrency(value, { ...opts, symbol })
  }

  return format
}
