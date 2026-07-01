import { Router, Response } from 'express'
import prisma from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'
import { createGoalSchema, updateGoalSchema } from '../lib/schemas'
import { asyncHandler } from '../lib/async-handler'
import { NotFoundError } from '../lib/errors'
import { invalidateCache } from '../lib/cache'

const router = Router()

// GET all goals
router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const goals = await prisma.goal.findMany({
    where: { userId: req.userId },
  })
  res.json(goals)
}))

// POST create goal
router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = createGoalSchema.parse(req.body)
  const { name, targetAmount, currentAmount, targetDate, icon } = parsed

  const goal = await prisma.goal.create({
    data: {
      name,
      targetAmount,
      currentAmount,
      targetDate: new Date(targetDate),
      icon,
      userId: req.userId!,
    },
  })

  // Invalidate reports cache
  invalidateCache(`reports:${req.userId}`)

  res.status(201).json(goal)
}))

// PATCH update goal (IDOR fix)
router.patch('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const goalId = String(req.params.id)

  const existing = await prisma.goal.findFirst({
    where: { id: goalId, userId: req.userId },
  })
  if (!existing) {
    throw new NotFoundError('Goal not found')
  }

  const parsed = updateGoalSchema.parse(req.body)

  const updated = await prisma.goal.update({
    where: { id: goalId },
    data: {
      ...parsed,
      ...(parsed.targetDate && { targetDate: new Date(parsed.targetDate) }),
    },
  })

  // Invalidate reports cache
  invalidateCache(`reports:${req.userId}`)

  res.json(updated)
}))

// DELETE goal (IDOR fix)
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const goalId = String(req.params.id)

  const existing = await prisma.goal.findFirst({
    where: { id: goalId, userId: req.userId },
  })
  if (!existing) {
    throw new NotFoundError('Goal not found')
  }

  await prisma.goal.delete({
    where: { id: goalId },
  })

  // Invalidate reports cache
  invalidateCache(`reports:${req.userId}`)

  res.json({ message: 'Goal deleted' })
}))

export default router