import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// GET all accounts
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const accounts = await prisma.account.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'asc' },
    })
    res.json(accounts)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// POST create account
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, type, balance } = req.body
    const account = await prisma.account.create({
      data: { name, type, balance, userId: req.userId! },
    })
    res.status(201).json(account)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// PATCH update account
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const account = await prisma.account.update({
      where: { id: String(req.params.id) },
      data: req.body,
    })
    res.json(account)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// DELETE account
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.account.delete({ where: { id: String(req.params.id) } })
    res.json({ message: 'Account deleted' })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router