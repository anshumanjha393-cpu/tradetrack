import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create demo user
  const hashed = await bcrypt.hash('demo1234', 10)
  const user = await prisma.user.upsert({
    where: { email: 'demo@tradetrack.com' },
    update: {},
    create: {
      email: 'demo@tradetrack.com',
      password: hashed,
      name: 'Alex Morgan',
    },
  })

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { id: 'cat_income' }, update: {}, create: { id: 'cat_income', name: 'Income', type: 'income', icon: 'wallet' } }),
    prisma.category.upsert({ where: { id: 'cat_housing' }, update: {}, create: { id: 'cat_housing', name: 'Housing', type: 'expense', icon: 'home' } }),
    prisma.category.upsert({ where: { id: 'cat_food' }, update: {}, create: { id: 'cat_food', name: 'Food', type: 'expense', icon: 'utensils' } }),
    prisma.category.upsert({ where: { id: 'cat_transport' }, update: {}, create: { id: 'cat_transport', name: 'Transport', type: 'expense', icon: 'car' } }),
    prisma.category.upsert({ where: { id: 'cat_shopping' }, update: {}, create: { id: 'cat_shopping', name: 'Shopping', type: 'expense', icon: 'shopping-bag' } }),
    prisma.category.upsert({ where: { id: 'cat_health' }, update: {}, create: { id: 'cat_health', name: 'Health', type: 'expense', icon: 'heart' } }),
    prisma.category.upsert({ where: { id: 'cat_entertainment' }, update: {}, create: { id: 'cat_entertainment', name: 'Entertainment', type: 'expense', icon: 'tv' } }),
    prisma.category.upsert({ where: { id: 'cat_utilities' }, update: {}, create: { id: 'cat_utilities', name: 'Utilities', type: 'expense', icon: 'zap' } }),
    prisma.category.upsert({ where: { id: 'cat_investments' }, update: {}, create: { id: 'cat_investments', name: 'Investments', type: 'expense', icon: 'trending-up' } }),
  ])

  const [income, housing, food, transport, shopping, health, entertainment, utilities, investments] = categories

  // Create accounts
  const checking = await prisma.account.upsert({
    where: { id: 'acc_checking' },
    update: {},
    create: { id: 'acc_checking', userId: user.id, name: 'Checking Account', type: 'checking', balance: 24847.32 },
  })
  const savings = await prisma.account.upsert({
    where: { id: 'acc_savings' },
    update: {},
    create: { id: 'acc_savings', userId: user.id, name: 'Savings Account', type: 'savings', balance: 156250.00 },
  })
  const brokerage = await prisma.account.upsert({
    where: { id: 'acc_brokerage' },
    update: {},
    create: { id: 'acc_brokerage', userId: user.id, name: 'Brokerage Account', type: 'brokerage', balance: 434127.00 },
  })
  const retirement = await prisma.account.upsert({
    where: { id: 'acc_401k' },
    update: {},
    create: { id: 'acc_401k', userId: user.id, name: '401k Retirement', type: 'retirement', balance: 289500.00 },
  })

  // Create transactions
  const txData = [
    { accountId: checking.id, categoryId: income.id, amount: 8200, description: 'Acme Corp Payroll', date: '2026-06-01' },
    { accountId: checking.id, categoryId: housing.id, amount: -2850, description: 'Maple Street Mortgage', date: '2026-06-02' },
    { accountId: checking.id, categoryId: food.id, amount: -184.32, description: 'Whole Foods Market', date: '2026-06-03' },
    { accountId: brokerage.id, categoryId: investments.id, amount: -3000, description: 'Vanguard Transfer', date: '2026-06-04' },
    { accountId: checking.id, categoryId: transport.id, amount: -68.4, description: 'Shell Gas Station', date: '2026-06-05' },
    { accountId: checking.id, categoryId: shopping.id, amount: -1299, description: 'Apple Store', date: '2026-06-06' },
    { accountId: checking.id, categoryId: health.id, amount: -420, description: 'Blue Cross Premium', date: '2026-06-07' },
    { accountId: checking.id, categoryId: entertainment.id, amount: -22.99, description: 'Netflix', date: '2026-06-08' },
    { accountId: checking.id, categoryId: utilities.id, amount: -148.5, description: 'Pacific Gas & Electric', date: '2026-06-09' },
    { accountId: checking.id, categoryId: income.id, amount: 2400, description: 'Freelance Invoice #214', date: '2026-06-10' },
    { accountId: checking.id, categoryId: food.id, amount: -96.18, description: "Trader Joe's", date: '2026-06-11' },
    { accountId: checking.id, categoryId: transport.id, amount: -34.2, description: 'Uber', date: '2026-06-12' },
    { accountId: checking.id, categoryId: shopping.id, amount: -512.75, description: 'Nordstrom', date: '2026-06-13' },
    { accountId: checking.id, categoryId: entertainment.id, amount: -16.99, description: 'Spotify', date: '2026-06-14' },
    { accountId: checking.id, categoryId: health.id, amount: -240, description: 'Equinox Membership', date: '2026-06-15' },
    { accountId: brokerage.id, categoryId: income.id, amount: 642.18, description: 'Dividend — VTI', date: '2026-06-16' },
    { accountId: checking.id, categoryId: utilities.id, amount: -89.99, description: 'Comcast Internet', date: '2026-06-17' },
    { accountId: checking.id, categoryId: transport.id, amount: -784.6, description: 'Delta Airlines', date: '2026-06-18' },
    { accountId: checking.id, categoryId: shopping.id, amount: -213.44, description: 'Amazon', date: '2026-06-19' },
    { accountId: checking.id, categoryId: food.id, amount: -28.5, description: 'Sweetgreen', date: '2026-06-20' },
  ]

  for (const tx of txData) {
    await prisma.transaction.create({
      data: {
        accountId: tx.accountId,
        categoryId: tx.categoryId,
        amount: tx.amount,
        description: tx.description,
        date: new Date(tx.date),
        tags: [],
        isRecurring: false,
      },
    })
  }

  // Create holdings
  const holdingsData = [
    { ticker: 'AAPL', quantity: 320, costBasis: 142.5, lastPrice: 214.3 },
    { ticker: 'MSFT', quantity: 180, costBasis: 268.4, lastPrice: 441.6 },
    { ticker: 'NVDA', quantity: 140, costBasis: 98.2, lastPrice: 128.7 },
    { ticker: 'VTI', quantity: 540, costBasis: 210.1, lastPrice: 287.4 },
    { ticker: 'TSLA', quantity: 90, costBasis: 248.9, lastPrice: 196.3 },
    { ticker: 'AMZN', quantity: 210, costBasis: 132.7, lastPrice: 201.8 },
    { ticker: 'GOOGL', quantity: 160, costBasis: 128.4, lastPrice: 178.9 },
    { ticker: 'JPM', quantity: 120, costBasis: 154.2, lastPrice: 201.5 },
  ]

  for (const h of holdingsData) {
    await prisma.holding.create({
      data: { ...h, userId: user.id, lastFetched: new Date() },
    })
  }

  // Create budgets
  const budgetsData = [
    { categoryId: housing.id, monthlyLimit: 3200, month: '2026-06-01' },
    { categoryId: food.id, monthlyLimit: 800, month: '2026-06-01' },
    { categoryId: transport.id, monthlyLimit: 500, month: '2026-06-01' },
    { categoryId: shopping.id, monthlyLimit: 1500, month: '2026-06-01' },
    { categoryId: health.id, monthlyLimit: 800, month: '2026-06-01' },
    { categoryId: entertainment.id, monthlyLimit: 300, month: '2026-06-01' },
  ]

  for (const b of budgetsData) {
    await prisma.budget.create({
      data: { userId: user.id, categoryId: b.categoryId, monthlyLimit: b.monthlyLimit, month: new Date(b.month) },
    })
  }

  // Create goals
  const goalsData = [
    { name: 'Emergency Fund', targetAmount: 10000, currentAmount: 8500, targetDate: '2026-12-01', icon: '🛡️' },
    { name: 'House Down Payment', targetAmount: 80000, currentAmount: 42000, targetDate: '2027-06-01', icon: '🏠' },
    { name: 'Vacation Fund', targetAmount: 5000, currentAmount: 2800, targetDate: '2026-03-01', icon: '✈️' },
    { name: 'Investment Portfolio', targetAmount: 500000, currentAmount: 434000, targetDate: '2026-12-01', icon: '📈' },
  ]

  for (const g of goalsData) {
    await prisma.goal.create({
      data: { userId: user.id, ...g, targetAmount: g.targetAmount, currentAmount: g.currentAmount, targetDate: new Date(g.targetDate) },
    })
  }

  console.log('✅ Seed complete — demo@tradetrack.com / demo1234')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())