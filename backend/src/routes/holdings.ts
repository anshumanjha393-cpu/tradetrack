import { Router, Response } from 'express'
import prisma from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'
import { createHoldingSchema, updateHoldingSchema } from '../lib/schemas'
import { asyncHandler } from '../lib/async-handler'
import { NotFoundError, BadRequestError } from '../lib/errors'
import { invalidateCache } from '../lib/cache'
import { logger } from '../lib/logger'

const router = Router()

const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour
const REQUEST_DELAY_MS = 200 // delay between Alpha Vantage fallback requests

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isStale(lastFetched: Date | null): boolean {
  if (!lastFetched) return true
  return Date.now() - new Date(lastFetched).getTime() > CACHE_TTL_MS
}

async function fetchYahooFinancePrices(tickers: string[]): Promise<Record<string, number>> {
  if (tickers.length === 0) return {}
  try {
    const symbols = tickers.map(t => encodeURIComponent(t)).join(',')
    const response = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      }
    )
    if (!response.ok) {
      logger.warn(`Yahoo Finance API responded with status ${response.status}`)
      return {}
    }
    const data = await response.json() as any
    const result = data?.quoteResponse?.result || []
    const prices: Record<string, number> = {}
    for (const item of result) {
      if (item.symbol && typeof item.regularMarketPrice === 'number') {
        prices[item.symbol.toUpperCase()] = item.regularMarketPrice
      }
    }
    return prices
  } catch (err: any) {
    logger.error(`Yahoo Finance API error: ${err.message}`)
    return {}
  }
}

async function fetchAlphaVantagePrice(ticker: string, apiKey: string): Promise<number | null> {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(ticker)}&apikey=${apiKey}`
    )
    if (!response.ok) return null
    const data = (await response.json()) as Record<string, any>
    const price = parseFloat(data['Global Quote']?.['05. price'] || '0')
    return price > 0 ? price : null
  } catch {
    return null
  }
}

// GET all holdings
router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const holdings = await prisma.holding.findMany({
    where: { userId: req.userId },
    orderBy: { ticker: 'asc' },
  })
  res.json(holdings)
}))

// POST /api/holdings/refresh - refresh prices using fast Yahoo Finance batch queries, falling back to Alpha Vantage
router.post('/refresh', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const holdings = await prisma.holding.findMany({
    where: { userId: req.userId },
    orderBy: { ticker: 'asc' },
  })

  if (holdings.length === 0) {
    return res.json({ holdings: [], summary: { fetched: 0, cached: 0, failed: 0 } })
  }

  const tickersToFetch = holdings
    .filter(h => isStale(h.lastFetched))
    .map(h => h.ticker.toUpperCase())

  const cachedCount = holdings.length - tickersToFetch.length

  let fetched = 0
  let failed = 0

  // Fetch prices in batch from Yahoo Finance
  let batchPrices: Record<string, number> = {}
  if (tickersToFetch.length > 0) {
    batchPrices = await fetchYahooFinancePrices(tickersToFetch)
  }

  const apiKey = process.env.ALPHA_VANTAGE_API_KEY

  const updatedHoldings = await Promise.all(
    holdings.map(async (h, index) => {
      if (!isStale(h.lastFetched)) {
        return {
          ...h,
          lastPrice: Number(h.lastPrice),
          lastFetched: h.lastFetched?.toISOString() ?? null,
          priceSource: 'cached' as const,
        }
      }

      // Try batch price from Yahoo Finance first
      let price: number | null = batchPrices[h.ticker.toUpperCase()] ?? null

      // Fallback to Alpha Vantage if Yahoo Finance failed
      if (price === null && apiKey) {
        if (index > 0) {
          await sleep(REQUEST_DELAY_MS) // sequential delay to avoid AV rate limit
        }
        price = await fetchAlphaVantagePrice(h.ticker, apiKey)
      }

      if (price !== null) {
        const updated = await prisma.holding.update({
          where: { id: h.id },
          data: {
            lastPrice: price,
            lastFetched: new Date(),
          },
        })
        fetched++
        return {
          ...updated,
          lastPrice: Number(updated.lastPrice),
          lastFetched: updated.lastFetched?.toISOString() ?? null,
          priceSource: 'live' as const,
        }
      }

      // Fetch failed - return cached price
      failed++
      return {
        ...h,
        lastPrice: Number(h.lastPrice),
        lastFetched: h.lastFetched?.toISOString() ?? null,
        priceSource: 'error' as const,
      }
    })
  )

  // Invalidate reports cache since holdings prices updated portfolio value
  if (fetched > 0) {
    invalidateCache(`reports:${req.userId}`)
  }

  res.json({
    holdings: updatedHoldings,
    summary: { fetched, cached: cachedCount, failed },
  })
}))

// POST create holding
router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = createHoldingSchema.parse(req.body)
  const { ticker, quantity, costBasis, lastPrice } = parsed

  const holding = await prisma.holding.create({
    data: {
      ticker: ticker.toUpperCase(),
      quantity,
      costBasis,
      lastPrice,
      userId: req.userId!,
      lastFetched: new Date(),
    },
  })

  // Invalidate reports cache
  invalidateCache(`reports:${req.userId}`)

  res.status(201).json(holding)
}))

// PATCH update holding (IDOR fix)
router.patch('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const holdingId = String(req.params.id)

  const existing = await prisma.holding.findFirst({
    where: { id: holdingId, userId: req.userId },
  })
  if (!existing) {
    throw new NotFoundError('Holding not found')
  }

  const parsed = updateHoldingSchema.parse(req.body)

  const updated = await prisma.holding.update({
    where: { id: holdingId },
    data: parsed,
  })

  // Invalidate reports cache
  invalidateCache(`reports:${req.userId}`)

  res.json(updated)
}))

// DELETE holding (IDOR fix)
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const holdingId = String(req.params.id)

  const existing = await prisma.holding.findFirst({
    where: { id: holdingId, userId: req.userId },
  })
  if (!existing) {
    throw new NotFoundError('Holding not found')
  }

  await prisma.holding.delete({
    where: { id: holdingId },
  })

  // Invalidate reports cache
  invalidateCache(`reports:${req.userId}`)

  res.json({ message: 'Holding deleted' })
}))

export default router
