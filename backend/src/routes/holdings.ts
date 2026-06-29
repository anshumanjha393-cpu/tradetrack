import { Router, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour
const REQUEST_DELAY_MS = 200 // delay between Alpha Vantage requests

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isStale(lastFetched: Date | null): boolean {
  if (!lastFetched) return true
  return Date.now() - new Date(lastFetched).getTime() > CACHE_TTL_MS
}

async function fetchAlphaVantagePrice(ticker: string, apiKey: string): Promise<number | null> {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(ticker)}&apikey=${apiKey}`,
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
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const holdings = await prisma.holding.findMany({
      where: { userId: req.userId },
      orderBy: { ticker: 'asc' },
    })
    res.json(holdings)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/holdings/prices - fetch live prices from Alpha Vantage with caching
router.get('/prices', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'Alpha Vantage API key not configured' })
    }

    const holdings = await prisma.holding.findMany({
      where: { userId: req.userId },
      orderBy: { ticker: 'asc' },
    })

    if (holdings.length === 0) {
      return res.json({ holdings: [], summary: { fetched: 0, cached: 0, failed: 0 } })
    }

    let fetched = 0
    let cached = 0
    let failed = 0

    const updatedHoldings = await Promise.all(
      holdings.map(async (h, index) => {
        if (!isStale(h.lastFetched)) {
          cached++
          return {
            ...h,
            lastPrice: Number(h.lastPrice),
            lastFetched: h.lastFetched?.toISOString() ?? null,
            priceSource: 'cached' as const,
          }
        }

        // Rate limit: add delay between requests (skip delay for first request)
        if (index > 0) {
          await sleep(REQUEST_DELAY_MS)
        }

        const price = await fetchAlphaVantagePrice(h.ticker, apiKey)

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

        // Fetch failed - return cached price with error indicator
        failed++
        return {
          ...h,
          lastPrice: Number(h.lastPrice),
          lastFetched: h.lastFetched?.toISOString() ?? null,
          priceSource: 'error' as const,
        }
      }),
    )

    res.json({
      holdings: updatedHoldings,
      summary: { fetched, cached, failed },
    })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// POST create holding
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { ticker, quantity, costBasis, lastPrice } = req.body
    const holding = await prisma.holding.create({
      data: {
        ticker: ticker.toUpperCase(),
        quantity,
        costBasis,
        lastPrice,
        userId: req.userId!,
      },
    })
    res.status(201).json(holding)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// PATCH update holding
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const holding = await prisma.holding.update({
      where: { id: String(req.params.id) },
      data: req.body,
    })
    res.json(holding)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// DELETE holding
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.holding.delete({ where: { id: String(req.params.id) } })
    res.json({ message: 'Holding deleted' })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
