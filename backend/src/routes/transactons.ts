import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// GET all transactions
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { accountId, category, page = '1' } = req.query
    const pageNum = parseInt(page as string)
    const take = 20
    const skip = (pageNum - 1) * take

    const accounts = await prisma.account.findMany({
      where: { userId: req.userId },
      select: { id: true },
    })
    const accountIds = accounts.map((a) => a.id)

    const transactions = await prisma.transaction.findMany({
      where: {
        accountId: accountId
          ? (accountId as string)
          : { in: accountIds },
        ...(category && {
          category: { name: category as string },
        }),
      },
      include: { category: true, account: true },
      orderBy: { date: 'desc' },
      take,
      skip,
    })

    res.json(transactions)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// POST create transaction
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { accountId, categoryId, amount, description, date, tags, isRecurring } = req.body

    const transaction = await prisma.transaction.create({
      data: {
        accountId,
        categoryId,
        amount,
        description,
        date: new Date(date),
        tags: tags || [],
        isRecurring: isRecurring || false,
      },
      include: { category: true, account: true },
    })

    res.status(201).json(transaction)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// PATCH update transaction
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const transaction = await prisma.transaction.update({
      where: { id: String(req.params.id) },
      data: req.body,
      include: { category: true, account: true },
    })
    res.json(transaction)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// DELETE transaction
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.transaction.delete({ where: { id: String(req.params.id) } })
    res.json({ message: 'Transaction deleted' })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router