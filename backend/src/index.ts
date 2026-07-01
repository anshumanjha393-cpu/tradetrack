import express from 'express'
import cors from 'cors'
import compression from 'compression'
import dotenv from 'dotenv'
import helmet from 'helmet'
import authRoutes from './routes/auth'
import accountRoutes from './routes/accounts'
import transactionRoutes from './routes/transactions'
import holdingRoutes from './routes/holdings'
import budgetRoutes from './routes/budgets'
import goalRoutes from './routes/goals'
import reportRoutes from './routes/reports'
import { errorHandler } from './middleware/error'
import { logger } from './lib/logger'

// Load environment variables
dotenv.config()

// Fail-fast checks on startup
if (!process.env.DATABASE_URL) {
  logger.error('CRITICAL: DATABASE_URL environment variable is missing!')
  process.exit(1)
}

if (!process.env.JWT_SECRET) {
  logger.error('CRITICAL: JWT_SECRET environment variable is missing!')
  process.exit(1)
}

const app = express()
const PORT = process.env.PORT || 5000

// Helmet configuration for standard security headers
app.use(helmet())

// Compression for production performance
app.use(compression())

// CORS — allow dev and production origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://tradetrack-wine.vercel.app',
  process.env.ALLOWED_ORIGIN,
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/accounts', accountRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/holdings', holdingRoutes)
app.use('/api/budgets', budgetRoutes)
app.use('/api/goals', goalRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TradeTrack API running' })
})

// 404 catch-all for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` })
})

// Global Error Handler (must be registered after all routes)
app.use(errorHandler)

// Graceful shutdown handling
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})

const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Shutting down server gracefully...`)
  server.close(() => {
    logger.info('HTTP server closed.')
    process.exit(0)
  })

  // Timeout shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forceful shutdown triggered.')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))