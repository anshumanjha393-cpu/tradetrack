import { z } from 'zod'

export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
})

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const accountTypeSchema = z.enum(['checking', 'savings', 'investment', 'brokerage', 'retirement', 'credit'])

export const createAccountSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(50),
  type: accountTypeSchema,
  balance: z.number({ message: 'Initial balance must be a number' }),
})

export const updateAccountSchema = createAccountSchema.partial()

export const createTransactionSchema = z.object({
  accountId: z.string().min(1, 'Account ID is required'),
  categoryId: z.string().nullable().optional(),
  amount: z.number({ message: 'Amount must be a number' }),
  description: z.string().min(1, 'Description is required').max(100),
  date: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).or(z.date()),
  tags: z.array(z.string()).optional().default([]),
  isRecurring: z.boolean().optional().default(false),
})

export const updateTransactionSchema = createTransactionSchema.partial()

export const createHoldingSchema = z.object({
  ticker: z.string().min(1, 'Ticker is required').toUpperCase(),
  quantity: z.number().positive('Quantity must be positive'),
  costBasis: z.number().nonnegative('Cost basis must be non-negative'),
  lastPrice: z.number().nonnegative('Last price must be non-negative'),
})

export const updateHoldingSchema = createHoldingSchema.partial()

export const createBudgetSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  monthlyLimit: z.number().positive('Monthly limit must be positive'),
  month: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).or(z.date()),
})

export const updateBudgetSchema = createBudgetSchema.partial()

export const createGoalSchema = z.object({
  name: z.string().min(1, 'Goal name is required').max(50),
  targetAmount: z.number().positive('Target amount must be positive'),
  currentAmount: z.number().nonnegative('Current amount must be non-negative'),
  targetDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).or(z.date()),
  icon: z.string().nullable().optional(),
})

export const updateGoalSchema = createGoalSchema.partial()
