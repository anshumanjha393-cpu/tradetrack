import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ReactNode } from 'react'
import { CurrencyProvider, useCurrency } from '@/lib/currency-context'
import { useCurrencyFormatter } from '@/lib/use-currency-formatter'

function wrapper({ children }: { children: ReactNode }) {
  return <CurrencyProvider>{children}</CurrencyProvider>
}

describe('CurrencyContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('defaults to USD', () => {
    const { result } = renderHook(() => useCurrency(), { wrapper })

    expect(result.current.currency).toBe('USD')
    expect(result.current.symbol).toBe('$')
  })

  it('reads currency from localStorage', () => {
    localStorage.setItem('currency', 'INR')

    const { result } = renderHook(() => useCurrency(), { wrapper })

    expect(result.current.currency).toBe('INR')
    expect(result.current.symbol).toBe('₹')
  })

  it('setCurrency updates currency and persists to localStorage', () => {
    const { result } = renderHook(() => useCurrency(), { wrapper })

    act(() => {
      result.current.setCurrency('INR')
    })

    expect(result.current.currency).toBe('INR')
    expect(result.current.symbol).toBe('₹')
    expect(localStorage.getItem('currency')).toBe('INR')
  })

  it('throws when used outside provider', () => {
    const consoleError = console.error
    console.error = vi.fn()

    expect(() => {
      renderHook(() => useCurrency())
    }).toThrow('useCurrency must be used within CurrencyProvider')

    console.error = consoleError
  })
})

describe('useCurrencyFormatter', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('formats with USD symbol by default', () => {
    const { result } = renderHook(() => useCurrencyFormatter(), { wrapper })

    expect(result.current(1234)).toBe('$1,234')
  })

  it('formats with INR symbol when currency is INR', () => {
    localStorage.setItem('currency', 'INR')

    const { result } = renderHook(() => useCurrencyFormatter(), { wrapper })

    expect(result.current(1234)).toBe('₹1,234')
  })

  it('formats with sign option', () => {
    const { result } = renderHook(() => useCurrencyFormatter(), { wrapper })

    expect(result.current(500, { sign: true })).toBe('+$500')
    expect(result.current(-500, { sign: true })).toBe('-$500')
  })

  it('formats with compact option', () => {
    const { result } = renderHook(() => useCurrencyFormatter(), { wrapper })

    expect(result.current(1500, { compact: true })).toBe('$1.5k')
    expect(result.current(100000, { compact: true })).toBe('$100k')
  })
})
