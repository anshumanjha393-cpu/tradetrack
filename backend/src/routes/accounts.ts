import { Router, Response } from 'express'
import prisma from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'
import { createAccountSchema, updateAccountSchema } from '../lib/schemas'
import { asyncHandler } from '../lib/async-handler'
import { NotFoundError } from '../lib/errors'
import { invalidateCache } from '../lib/cache'

const router = Router()

// GET all accounts
router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const accounts = await prisma.account.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'asc' },
  })
  res.json(accounts)
}))

// POST create account
router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = createAccountSchema.parse(req.body)
  const { name, type, balance } = parsed

  const account = await prisma.account.create({
    data: {
      name,
      type,
      balance,
      userId: req.userId!,
    },
  })

  // Invalidate reports cache for this user
  invalidateCache(`reports:${req.userId}`)

  res.status(201).json(account)
}))

// PATCH update account (IDOR fix & Whitelisting)
router.patch('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const accountId = String(req.params.id)
  
  // Verify ownership to prevent IDOR
  const existing = await prisma.account.findFirst({
    where: { id: accountId, userId: req.userId },
  })
  if (!existing) {
    throw new NotFoundError('Account not found')
  }

  // Parse and validate only allowed fields
  const parsed = updateAccountSchema.parse(req.body)

  const updated = await prisma.account.update({
    where: { id: accountId },
    data: parsed,
  })

  // Invalidate reports cache for this user
  invalidateCache(`reports:${req.userId}`)

  res.json(updated)
}))

// DELETE account (IDOR fix)
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const accountId = String(req.params.id)

  // Verify ownership to prevent IDOR
  const existing = await prisma.account.findFirst({
    where: { id: accountId, userId: req.userId },
  })
  if (!existing) {
    throw new NotFoundError('Account not found')
  }

  await prisma.account.delete({
    where: { id: accountId },
  })

  // Invalidate reports cache for this user
  invalidateCache(`reports:${req.userId}`)

  res.json({ message: 'Account deleted' })
}))

export default router