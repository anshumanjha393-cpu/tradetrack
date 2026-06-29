import { describe, it, expect } from 'vitest'
import { formatCurrency } from '@/lib/data'

describe('formatCurrency', () => {
  it('formats whole numbers with no decimals', () => {
    expect(formatCurrency(1234)).toBe('$1,234')
  })

  it('formats decimals with 2 decimal places', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50')
  })

  it('formats small decimals', () => {
    expect(formatCurrency(0.99)).toBe('$0.99')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0')
  })

  it('formats negative numbers', () => {
    expect(formatCurrency(-500)).toBe('-$500')
  })

  it('formats with custom symbol', () => {
    expect(formatCurrency(1000, { symbol: '€' })).toBe('€1,000')
    expect(formatCurrency(1000, { symbol: '₹' })).toBe('₹1,000')
    expect(formatCurrency(1000, { symbol: '£' })).toBe('£1,000')
  })

  it('adds + sign when sign option is true and value is positive', () => {
    expect(formatCurrency(500, { sign: true })).toBe('+$500')
  })

  it('adds - sign when sign option is true and value is negative', () => {
    expect(formatCurrency(-500, { sign: true })).toBe('-$500')
  })

  it('compacts numbers >= 100,000 without decimals', () => {
    expect(formatCurrency(150000, { compact: true })).toBe('$150k')
    expect(formatCurrency(1000000, { compact: true })).toBe('$1000k')
  })

  it('compacts numbers >= 1,000 but < 100,000 with 1 decimal', () => {
    expect(formatCurrency(1500, { compact: true })).toBe('$1.5k')
    expect(formatCurrency(25000, { compact: true })).toBe('$25.0k')
  })

  it('does not compact numbers < 1,000', () => {
    expect(formatCurrency(500, { compact: true })).toBe('$500')
  })

  it('compacts negative numbers', () => {
    expect(formatCurrency(-1500, { compact: true })).toBe('-$1.5k')
  })

  it('combines compact and sign', () => {
    expect(formatCurrency(1500, { compact: true, sign: true })).toBe('+$1.5k')
  })
})
