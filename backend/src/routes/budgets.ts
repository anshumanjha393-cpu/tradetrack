import { Router, Response } from 'express'
import prisma from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'
import { createBudgetSchema, updateBudgetSchema } from '../lib/schemas'
import { asyncHandler } from '../lib/async-handler'
import { NotFoundError } from '../lib/errors'
import { invalidateCache } from '../lib/cache'

const router = Router()

// GET all budgets
router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const budgets = await prisma.budget.findMany({
    where: { userId: req.userId },
    include: { category: true },
  })
  res.json(budgets)
}))

// POST create budget
router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = createBudgetSchema.parse(req.body)
  const { categoryId, monthlyLimit, month } = parsed

  // Verify category exists
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  })
  if (!category) {
    throw new NotFoundError('Category not found')
  }

  // Create budget
  const budget = await prisma.budget.create({
    data: {
      categoryId,
      monthlyLimit,
      month: new Date(month),
      userId: req.userId!,
    },
    include: { category: true },
  })

  // Invalidate reports cache
  invalidateCache(`reports:${req.userId}`)

  res.status(201).json(budget)
}))

// PATCH update budget (IDOR fix)
router.patch('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const budgetId = String(req.params.id)

  const existing = await prisma.budget.findFirst({
    where: { id: budgetId, userId: req.userId },
  })
  if (!existing) {
    throw new NotFoundError('Budget not found')
  }

  const parsed = updateBudgetSchema.parse(req.body)

  if (parsed.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: parsed.categoryId },
    })
    if (!category) {
      throw new NotFoundError('Category not found')
    }
  }

  const updated = await prisma.budget.update({
    where: { id: budgetId },
    data: {
      ...parsed,
      ...(parsed.month && { month: new Date(parsed.month) }),
    },
    include: { category: true },
  })

  // Invalidate reports cache
  invalidateCache(`reports:${req.userId}`)

  res.json(updated)
}))

// DELETE budget (IDOR fix)
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const budgetId = String(req.params.id)

  const existing = await prisma.budget.findFirst({
    where: { id: budgetId, userId: req.userId },
  })
  if (!existing) {
    throw new NotFoundError('Budget not found')
  }

  await prisma.budget.delete({
    where: { id: budgetId },
  })

  // Invalidate reports cache
  invalidateCache(`reports:${req.userId}`)

  res.json({ message: 'Budget deleted' })
}))

export default router