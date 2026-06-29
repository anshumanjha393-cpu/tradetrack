import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// GET all goals
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.userId },
    })
    res.json(goals)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// POST create goal
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, targetAmount, currentAmount, targetDate, icon } = req.body
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
    res.status(201).json(goal)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// PATCH update goal
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const goal = await prisma.goal.update({
      where: { id: String(req.params.id) },
      data: req.body,
    })
    res.json(goal)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// DELETE goal
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.goal.delete({ where: { id: String(req.params.id) } })
    res.json({ message: 'Goal deleted' })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router