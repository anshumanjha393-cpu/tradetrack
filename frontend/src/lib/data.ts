export const netWorth = {
  total: 1284750,
  changePct: 8.4,
  changeValue: 99480,
}

export const accountSummary = [
  { label: 'Cash', value: 84200 },
  { label: 'Investments', value: 962400 },
  { label: 'Real Estate', value: 310000 },
  { label: 'Liabilities', value: -71850 },
]

export const performance = [
  { month: 'Jan', value: 1042000 },
  { month: 'Feb', value: 1068000 },
  { month: 'Mar', value: 1031000 },
  { month: 'Apr', value: 1095000 },
  { month: 'May', value: 1142000 },
  { month: 'Jun', value: 1118000 },
  { month: 'Jul', value: 1187000 },
  { month: 'Aug', value: 1205000 },
  { month: 'Sep', value: 1168000 },
  { month: 'Oct', value: 1224000 },
  { month: 'Nov', value: 1259000 },
  { month: 'Dec', value: 1284750 },
]

export type Category =
  | 'Income'
  | 'Housing'
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Investments'
  | 'Health'
  | 'Entertainment'
  | 'Utilities'

export type Transaction = {
  id: string
  name: string
  category: Category
  amount: number
  date: string
}

export const transactions: Transaction[] = [
  { id: 't1', name: 'Acme Corp Payroll', category: 'Income', amount: 8200, date: '2026-06-01' },
  { id: 't2', name: 'Maple Street Mortgage', category: 'Housing', amount: -2850, date: '2026-06-02' },
  { id: 't3', name: 'Whole Foods Market', category: 'Food', amount: -184.32, date: '2026-06-03' },
  { id: 't4', name: 'Vanguard Transfer', category: 'Investments', amount: -3000, date: '2026-06-04' },
  { id: 't5', name: 'Shell Gas Station', category: 'Transport', amount: -68.4, date: '2026-06-05' },
  { id: 't6', name: 'Apple Store', category: 'Shopping', amount: -1299, date: '2026-06-06' },
  { id: 't7', name: 'Blue Cross Premium', category: 'Health', amount: -420, date: '2026-06-07' },
  { id: 't8', name: 'Netflix', category: 'Entertainment', amount: -22.99, date: '2026-06-08' },
  { id: 't9', name: 'Pacific Gas & Electric', category: 'Utilities', amount: -148.5, date: '2026-06-09' },
  { id: 't10', name: 'Freelance Invoice #214', category: 'Income', amount: 2400, date: '2026-06-10' },
  { id: 't11', name: 'Trader Joe\u2019s', category: 'Food', amount: -96.18, date: '2026-06-11' },
  { id: 't12', name: 'Uber', category: 'Transport', amount: -34.2, date: '2026-06-12' },
  { id: 't13', name: 'Nordstrom', category: 'Shopping', amount: -512.75, date: '2026-06-13' },
  { id: 't14', name: 'Spotify', category: 'Entertainment', amount: -16.99, date: '2026-06-14' },
  { id: 't15', name: 'Equinox Membership', category: 'Health', amount: -240, date: '2026-06-15' },
  { id: 't16', name: 'Dividend — VTI', category: 'Income', amount: 642.18, date: '2026-06-16' },
  { id: 't17', name: 'Comcast Internet', category: 'Utilities', amount: -89.99, date: '2026-06-17' },
  { id: 't18', name: 'Delta Airlines', category: 'Transport', amount: -784.6, date: '2026-06-18' },
  { id: 't19', name: 'Amazon', category: 'Shopping', amount: -213.44, date: '2026-06-19' },
  { id: 't20', name: 'Sweetgreen', category: 'Food', amount: -28.5, date: '2026-06-20' },
]

export type Budget = {
  category: string
  spent: number
  limit: number
}

export const budgets: Budget[] = [
  { category: 'Housing', spent: 2850, limit: 3200 },
  { category: 'Food', spent: 720, limit: 650 },
  { category: 'Transport', spent: 412, limit: 500 },
  { category: 'Shopping', spent: 2238, limit: 1500 },
  { category: 'Entertainment', spent: 188, limit: 300 },
  { category: 'Health', spent: 660, limit: 800 },
]

export type Holding = {
  ticker: string
  name: string
  quantity: number
  avgCost: number
  price: number
}

export const holdings: Holding[] = [
  { ticker: 'AAPL', name: 'Apple Inc.', quantity: 320, avgCost: 142.5, price: 214.3 },
  { ticker: 'MSFT', name: 'Microsoft Corp.', quantity: 180, avgCost: 268.4, price: 441.6 },
  { ticker: 'NVDA', name: 'NVIDIA Corp.', quantity: 140, avgCost: 98.2, price: 128.7 },
  { ticker: 'VTI', name: 'Vanguard Total Market', quantity: 540, avgCost: 210.1, price: 287.4 },
  { ticker: 'TSLA', name: 'Tesla Inc.', quantity: 90, avgCost: 248.9, price: 196.3 },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', quantity: 210, avgCost: 132.7, price: 201.8 },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', quantity: 160, avgCost: 128.4, price: 178.9 },
  { ticker: 'JPM', name: 'JPMorgan Chase', quantity: 120, avgCost: 154.2, price: 201.5 },
]

export const cashFlow = {
  income: [
    { name: 'Salary', value: 9840 },
    { name: 'Dividends', value: 642 },
    { name: 'Freelance', value: 2400 },
  ],
  expenses: [
    { name: 'Housing', value: 2850 },
    { name: 'Food', value: 720 },
    { name: 'Shopping', value: 2238 },
    { name: 'Transport', value: 412 },
    { name: 'Investments', value: 3000 },
    { name: 'Other', value: 1100 },
  ],
}

export const incomeVsExpense = [
  { month: 'Jan', income: 11200, expense: 8400 },
  { month: 'Feb', income: 10800, expense: 9100 },
  { month: 'Mar', income: 12400, expense: 7900 },
  { month: 'Apr', income: 11900, expense: 10200 },
  { month: 'May', income: 13100, expense: 8800 },
  { month: 'Jun', income: 12882, expense: 9320 },
]

/**
 * Formats a number as a currency string with optional compact notation and sign.
 *
 * @param value - The numeric value to format
 * @param opts - Formatting options
 * @param opts.compact - Use compact notation (e.g. `$1.5k`, `$150k`). Triggers at >= 1,000.
 * @param opts.sign - Prepend `+` for positive values, `-` for negative
 * @param opts.symbol - Currency symbol (default: `$`)
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1234)           // "$1,234"
 * formatCurrency(1500, { compact: true })  // "$1.5k"
 * formatCurrency(-500, { sign: true })     // "-$500"
 * formatCurrency(1000, { symbol: '€' })    // "€1,000"
 */
export function formatCurrency(value: number, opts?: { compact?: boolean; sign?: boolean; symbol?: string }) {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : opts?.sign ? '+' : ''
  const sym = opts?.symbol ?? '$'
  if (opts?.compact && abs >= 1000) {
    return `${sign}${sym}${(abs / 1000).toFixed(abs >= 100000 ? 0 : 1)}k`
  }
  return `${sign}${sym}${abs.toLocaleString('en-US', {
    minimumFractionDigits: abs % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`
}
