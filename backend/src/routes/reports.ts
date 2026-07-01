import { Router, Response } from 'express'
import prisma from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'
import { asyncHandler } from '../lib/async-handler'
import { getCache, setCache } from '../lib/cache'

const router = Router()

// GET cash flow data for Sankey (cached + date bounded)
router.get('/cashflow', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const cacheKey = `reports:cashflow:${req.userId}`
  const cachedData = getCache(cacheKey)
  if (cachedData) {
    return res.json(cachedData)
  }

  const accounts = await prisma.account.findMany({
    where: { userId: req.userId },
    select: { id: true },
  })
  const accountIds = accounts.map((a) => a.id)

  const now = new Date()
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
  
  // Apply date filtering to avoid O(N) memory scaling for historical data
  const startDate = req.query.startDate ? new Date(req.query.startDate as string) : oneYearAgo
  const endDate = req.query.endDate ? new Date(req.query.endDate as string) : now

  const transactions = await prisma.transaction.findMany({
    where: {
      accountId: { in: accountIds },
      date: { gte: startDate, lte: endDate },
    },
    include: { category: true },
  })

  const income = transactions
    .filter((t) => t.category?.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const expensesByCategory: Record<string, number> = {}
  transactions
    .filter((t) => t.category?.type === 'expense')
    .forEach((t) => {
      const name = t.category?.name || 'Other'
      expensesByCategory[name] = (expensesByCategory[name] || 0) + Number(t.amount)
    })

  const nodes = [
    { name: 'Income' },
    ...Object.keys(expensesByCategory).map((name) => ({ name })),
  ]

  const links = Object.entries(expensesByCategory).map(([name, value]) => ({
    source: 0,
    target: nodes.findIndex((n) => n.name === name),
    value: Math.abs(value),
  }))

  const reportData = { nodes, links, totalIncome: income }
  
  // Cache the generated report for 5 minutes
  setCache(cacheKey, reportData, 5 * 60 * 1000)

  res.json(reportData)
}))

// GET summary — net worth, monthly spend, P&L (cached)
router.get('/summary', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const cacheKey = `reports:summary:${req.userId}`
  const cachedData = getCache(cacheKey)
  if (cachedData) {
    return res.json(cachedData)
  }

  const accounts = await prisma.account.findMany({
    where: { userId: req.userId },
  })

  const netWorth = accounts.reduce((sum, a) => sum + Number(a.balance), 0)
  const accountIds = accounts.map((a) => a.id)

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const monthlyTransactions = await prisma.transaction.findMany({
    where: {
      accountId: { in: accountIds },
      date: { gte: startOfMonth },
    },
    include: { category: true },
  })

  const monthlyIncome = monthlyTransactions
    .filter((t) => t.category?.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const monthlyExpenses = monthlyTransactions
    .filter((t) => t.category?.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)

  const holdings = await prisma.holding.findMany({
    where: { userId: req.userId },
  })

  const portfolioValue = holdings.reduce(
    (sum, h) => sum + Number(h.lastPrice) * Number(h.quantity),
    0
  )

  const portfolioCost = holdings.reduce(
    (sum, h) => sum + Number(h.costBasis) * Number(h.quantity),
    0
  )

  const portfolioPnL = portfolioValue - portfolioCost

  const summaryData = {
    netWorth,
    monthlyIncome,
    monthlyExpenses,
    netSavings: monthlyIncome - monthlyExpenses,
    portfolioValue,
    portfolioPnL,
  }

  // Cache the summary for 5 minutes
  setCache(cacheKey, summaryData, 5 * 60 * 1000)

  res.json(summaryData)
}))

export default router