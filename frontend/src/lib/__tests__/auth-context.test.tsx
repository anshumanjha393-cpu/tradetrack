import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ReactNode } from 'react'
import { AuthProvider, useAuth } from '@/lib/auth-context'

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts unauthenticated when no token', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
  })

  it('starts authenticated when token exists in localStorage', () => {
    localStorage.setItem('token', 'existing-token')
    localStorage.setItem('user', JSON.stringify({ id: '1', name: 'Test', email: 't@t.com' }))

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.token).toBe('existing-token')
    expect(result.current.user).toEqual({ id: '1', name: 'Test', email: 't@t.com' })
  })

  it('login sets token and user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.login('new-token', { id: '2', name: 'Alice', email: 'alice@test.com' })
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.token).toBe('new-token')
    expect(result.current.user).toEqual({ id: '2', name: 'Alice', email: 'alice@test.com' })
    expect(localStorage.getItem('token')).toBe('new-token')
    expect(JSON.parse(localStorage.getItem('user')!)).toEqual({ id: '2', name: 'Alice', email: 'alice@test.com' })
  })

  it('logout clears token and user', () => {
    localStorage.setItem('token', 'tok')
    localStorage.setItem('user', JSON.stringify({ id: '1', name: 'Test', email: 't@t.com' }))

    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })

  it('throws when useAuth is used outside provider', () => {
    const consoleError = console.error
    console.error = vi.fn()

    expect(() => {
      renderHook(() => useAuth())
    }).toThrow('useAuth must be used within AuthProvider')

    console.error = consoleError
  })
})
