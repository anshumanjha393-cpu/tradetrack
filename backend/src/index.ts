import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import accountRoutes from './routes/accounts'
import transactionRoutes from './routes/transactons'
import holdingRoutes from './routes/holdings'
import budgetRoutes from './routes/budgets'
import goalRoutes from './routes/goals'
import reportRoutes from './routes/reports'
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use('/api/auth',authRoutes)
app.use('/api/accounts',accountRoutes)
app.use('/api/transactions',transactionRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/holdings', holdingRoutes)
app.use('/api/budgets', budgetRoutes)
app.use('/api/goals', goalRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TradeTrack API running' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})