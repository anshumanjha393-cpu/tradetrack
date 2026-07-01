import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import prisma from '../lib/prisma'
import { signupSchema, loginSchema } from '../lib/schemas'
import { asyncHandler } from '../lib/async-handler'
import { BadRequestError, UnauthorizedError } from '../lib/errors'

const router = Router()

// Rate limiting for auth endpoints (brute-force prevention)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: { error: 'Too many login or signup attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Signup
router.post('/signup', authLimiter, asyncHandler(async (req: Request, res: Response) => {
  const parsed = signupSchema.parse(req.body)
  const { email, password, name } = parsed

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new BadRequestError('Email already in use')
  }

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { email, password: hashed, name },
  })

  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    throw new Error('JWT_SECRET configuration is missing on the server')
  }

  const token = jwt.sign({ userId: user.id }, jwtSecret, {
    expiresIn: '7d',
  })

  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  })
}))

// Login
router.post('/login', authLimiter, asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.parse(req.body)
  const { email, password } = parsed

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new UnauthorizedError('Invalid credentials')
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    throw new UnauthorizedError('Invalid credentials')
  }

  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    throw new Error('JWT_SECRET configuration is missing on the server')
  }

  const token = jwt.sign({ userId: user.id }, jwtSecret, {
    expiresIn: '7d',
  })

  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  })
}))

export default router