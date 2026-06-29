

import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// GET cash flow data for Sankey
router.get('/cashflow', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const accounts = await prisma.account.findMany({
      where: { userId: req.userId },
      select: { id: true },
    })
    const accountIds = accounts.map((a) => a.id)

    const transactions = await prisma.transaction.findMany({
      where: { accountId: { in: accountIds } },
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

    res.json({ nodes, links, totalIncome: income })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// GET summary — net worth, monthly spend, P&L
router.get('/summary', authenticate, async (req: AuthRequest, res: Response) => {
  try {
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

    res.json({
      netWorth,
      monthlyIncome,
      monthlyExpenses,
      netSavings: monthlyIncome - monthlyExpenses,
      portfolioValue,
      portfolioPnL,
    })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router