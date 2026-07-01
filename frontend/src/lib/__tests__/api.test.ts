import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { api, getToken, setToken, removeToken } from '@/lib/api'

const BASE_URL = 'http://localhost:5000/api'

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const globalThisThis: any

describe('Token helpers', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('setToken stores token in localStorage', () => {
    setToken('abc123')
    expect(localStorage.getItem('token')).toBe('abc123')
  })

  it('getToken retrieves token from localStorage', () => {
    localStorage.setItem('token', 'test-token')
    expect(getToken()).toBe('test-token')
  })

  it('getToken returns null when no token exists', () => {
    expect(getToken()).toBeNull()
  })

  it('removeToken clears token from localStorage', () => {
    localStorage.setItem('token', 'test-token')
    removeToken()
    expect(localStorage.getItem('token')).toBeNull()
  })
})

describe('API client', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.spyOn(globalThis, 'fetch')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('signup sends POST request with correct body', async () => {
    const mockResponse = { token: 'tok', user: { id: '1', name: 'Test', email: 't@t.com' } }
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const result = await api.signup('Test', 't@t.com', 'password123')

    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/auth/signup`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test', email: 't@t.com', password: 'password123' }),
      }),
    )
    expect(result).toEqual(mockResponse)
  })

  it('login sends POST request with credentials', async () => {
    const mockResponse = { token: 'tok', user: { id: '1', name: 'Test', email: 't@t.com' } }
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    await api.login('t@t.com', 'password123')

    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/auth/login`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 't@t.com', password: 'password123' }),
      }),
    )
  })

  it('throws error on non-ok response', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid credentials' }),
    } as Response)

    await expect(api.login('bad@bad.com', 'wrong')).rejects.toThrow('Invalid credentials')
  })

  it('throws generic error when response has no error message', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response)

    await expect(api.login('x', 'y')).rejects.toThrow('Request failed')
  })

  it('getAccounts sends GET with auth header', async () => {
    localStorage.setItem('token', 'my-token')
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: '1', name: 'Checking' }],
    } as Response)

    await api.getAccounts()

    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/accounts`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer my-token',
        }),
      }),
    )
  })

  it('createAccount sends POST with body', async () => {
    localStorage.setItem('token', 'tok')
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1' }),
    } as Response)

    await api.createAccount({ name: 'Savings', type: 'savings', balance: 5000 })

    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/accounts`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Savings', type: 'savings', balance: 5000 }),
      }),
    )
  })

  it('deleteAccount sends DELETE request', async () => {
    localStorage.setItem('token', 'tok')
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response)

    await api.deleteAccount('acc-123')

    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/accounts/acc-123`,
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('getTransactions builds query string from params', async () => {
    localStorage.setItem('token', 'tok')
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response)

    await api.getTransactions({ accountId: 'a1', category: 'Food', page: 2 })

    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/transactions?accountId=a1&category=Food&page=2`,
      expect.anything(),
    )
  })

  it('getTransactions has no query string when no params', async () => {
    localStorage.setItem('token', 'tok')
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response)

    await api.getTransactions()

    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/transactions`,
      expect.anything(),
    )
  })

  it('createHolding sends POST with correct data', async () => {
    localStorage.setItem('token', 'tok')
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'h1' }),
    } as Response)

    await api.createHolding({ ticker: 'AAPL', quantity: 10, costBasis: 150, lastPrice: 175 })

    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/holdings`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ ticker: 'AAPL', quantity: 10, costBasis: 150, lastPrice: 175 }),
      }),
    )
  })

  it('refreshPrices sends POST to /holdings/refresh', async () => {
    localStorage.setItem('token', 'tok')
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ holdings: [], summary: { fetched: 0, cached: 0, failed: 0 } }),
    } as Response)

    await api.refreshPrices()

    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/holdings/refresh`,
      expect.objectContaining({ method: 'POST', headers: expect.anything() }),
    )
  })

  it('createBudget sends POST with data', async () => {
    localStorage.setItem('token', 'tok')
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'b1' }),
    } as Response)

    await api.createBudget({ categoryId: 'cat-1', monthlyLimit: 2000, month: '2026-06' })

    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/budgets`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ categoryId: 'cat-1', monthlyLimit: 2000, month: '2026-06' }),
      }),
    )
  })

  it('createGoal sends POST with data', async () => {
    localStorage.setItem('token', 'tok')
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'g1' }),
    } as Response)

    await api.createGoal({ name: 'Emergency Fund', targetAmount: 10000, currentAmount: 2500, targetDate: '2027-01-01', icon: 'Shield' })

    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/goals`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Emergency Fund', targetAmount: 10000, currentAmount: 2500, targetDate: '2027-01-01', icon: 'Shield' }),
      }),
    )
  })

  it('getSummary sends GET to /reports/summary with auth', async () => {
    localStorage.setItem('token', 'tok')
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ netWorth: 100000 }),
    } as Response)

    const result = await api.getSummary()

    expect(globalThis.fetch).toHaveBeenCalledWith(
      `${BASE_URL}/reports/summary`,
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer tok' }),
      }),
    )
    expect(result).toEqual({ netWorth: 100000 })
  })
})
