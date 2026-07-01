import { Router, Response } from 'express'
import prisma from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'
import { createTransactionSchema, updateTransactionSchema } from '../lib/schemas'
import { asyncHandler } from '../lib/async-handler'
import { NotFoundError } from '../lib/errors'
import { invalidateCache } from '../lib/cache'

const router = Router()

// GET all transactions
router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { accountId, category, page = '1' } = req.query
  const pageNum = parseInt(page as string) || 1
  const take = 20
  const skip = (pageNum - 1) * take

  // Fetch accounts owned by user to verify query permissions
  const accounts = await prisma.account.findMany({
    where: { userId: req.userId },
    select: { id: true },
  })
  const accountIds = accounts.map((a) => a.id)

  if (accountId) {
    if (!accountIds.includes(String(accountId))) {
      throw new NotFoundError('Account not found')
    }
  }

  const queryAccountId = accountId ? String(accountId) : { in: accountIds }

  const transactions = await prisma.transaction.findMany({
    where: {
      accountId: queryAccountId,
      ...(category && {
        category: { name: category as string },
      }),
    },
    include: { category: true, account: true },
    orderBy: { date: 'desc' },
    take,
    skip,
  })

  // Get total count for pagination metadata
  const totalCount = await prisma.transaction.count({
    where: {
      accountId: queryAccountId,
      ...(category && {
        category: { name: category as string },
      }),
    },
  })

  res.header('X-Total-Count', String(totalCount))
  res.header('X-Page-Count', String(Math.ceil(totalCount / take)))
  res.json(transactions)
}))

// POST create transaction
router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = createTransactionSchema.parse(req.body)
  const { accountId, categoryId, amount, description, date, tags, isRecurring } = parsed

  // Verify account ownership
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId: req.userId },
  })
  if (!account) {
    throw new NotFoundError('Account not found')
  }

  // Verify category if provided
  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    })
    if (!category) {
      throw new NotFoundError('Category not found')
    }
  }

  // Create transaction
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

  // Optionally update account balance (standard fintech flow)
  await prisma.account.update({
    where: { id: accountId },
    data: { balance: { increment: amount } },
  })

  // Invalidate reports cache
  invalidateCache(`reports:${req.userId}`)

  res.status(201).json(transaction)
}))

// PATCH update transaction (IDOR fix)
router.patch('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const transactionId = String(req.params.id)

  // Verify transaction belongs to an account owned by user
  const existing = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { account: true },
  })
  if (!existing || existing.account.userId !== req.userId) {
    throw new NotFoundError('Transaction not found')
  }

  const parsed = updateTransactionSchema.parse(req.body)

  // Verify target account ownership if it's changing
  if (parsed.accountId) {
    const targetAccount = await prisma.account.findFirst({
      where: { id: parsed.accountId, userId: req.userId },
    })
    if (!targetAccount) {
      throw new NotFoundError('Target account not found')
    }
  }

  // Verify target category if it's changing
  if (parsed.categoryId) {
    const targetCategory = await prisma.category.findUnique({
      where: { id: parsed.categoryId },
    })
    if (!targetCategory) {
      throw new NotFoundError('Target category not found')
    }
  }

  // If amount is changing, adjust account balance
  const amountDiff = parsed.amount !== undefined ? parsed.amount - Number(existing.amount) : 0

  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      ...parsed,
      ...(parsed.date && { date: new Date(parsed.date) }),
    },
    include: { category: true, account: true },
  })

  if (amountDiff !== 0) {
    await prisma.account.update({
      where: { id: existing.accountId },
      data: { balance: { increment: amountDiff } },
    })
  }

  // Invalidate reports cache
  invalidateCache(`reports:${req.userId}`)

  res.json(updated)
}))

// DELETE transaction (IDOR fix)
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const transactionId = String(req.params.id)

  // Verify ownership
  const existing = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { account: true },
  })
  if (!existing || existing.account.userId !== req.userId) {
    throw new NotFoundError('Transaction not found')
  }

  // Reverse transaction amount from account balance on delete
  await prisma.account.update({
    where: { id: existing.accountId },
    data: { balance: { decrement: existing.amount } },
  })

  await prisma.transaction.delete({
    where: { id: transactionId },
  })

  // Invalidate reports cache
  invalidateCache(`reports:${req.userId}`)

  res.json({ message: 'Transaction deleted' })
}))

export default router
