import { useCurrency } from '@/lib/currency-context'
import { formatCurrency } from '@/lib/data'

/**
 * Returns a `formatCurrency` function bound to the user's current currency.
 *
 * @returns A formatter function `(value, opts?) => string` that applies the
 *   current currency symbol and delegates to `formatCurrency`.
 *
 * @example
 * const format = useCurrencyFormatter()
 * format(1500, { compact: true }) // "$1.5k" or "₹1.5k"
 */
export function useCurrencyFormatter() {
  const { symbol } = useCurrency()

  const format = (value: number, opts?: { compact?: boolean; sign?: boolean }) => {
    return formatCurrency(value, { ...opts, symbol })
  }

  return format
}
