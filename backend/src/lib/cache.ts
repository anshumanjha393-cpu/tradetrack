import { logger } from './logger'

interface CacheEntry {
  data: any
  expiresAt: number
}

const cacheStore = new Map<string, CacheEntry>()

export const getCache = (key: string): any | null => {
  const entry = cacheStore.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(key)
    logger.debug(`Cache expired for key: ${key}`)
    return null
  }
  logger.debug(`Cache hit for key: ${key}`)
  return entry.data
}

export const setCache = (key: string, data: any, ttlMs = 5 * 60 * 1000): void => {
  cacheStore.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  })
  logger.debug(`Cache set for key: ${key} (TTL: ${ttlMs}ms)`)
}

export const invalidateCache = (keyPattern: string): void => {
  let deletedCount = 0
  for (const key of cacheStore.keys()) {
    if (key.startsWith(keyPattern)) {
      cacheStore.delete(key)
      deletedCount++
    }
  }
  if (deletedCount > 0) {
    logger.info(`Cache invalidated for pattern: "${keyPattern}" (${deletedCount} entries removed)`)
  }
}
