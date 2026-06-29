import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// GET all budgets
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const budgets = await prisma.budget.findMany({
      where: { userId: req.userId },
      include: { category: true },
    })
    res.json(budgets)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// POST create budget
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { categoryId, monthlyLimit, month } = req.body
    const budget = await prisma.budget.create({
      data: {
        categoryId,
        monthlyLimit,
        month: new Date(month),
        userId: req.userId!,
      },
      include: { category: true },
    })
    res.status(201).json(budget)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// PATCH update budget
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const budget = await prisma.budget.update({
      where: { id: String(req.params.id) },
      data: req.body,
      include: { category: true },
    })
    res.json(budget)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// DELETE budget
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.budget.delete({ where: { id: String(req.params.id) } })
    res.json({ message: 'Budget deleted' })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router