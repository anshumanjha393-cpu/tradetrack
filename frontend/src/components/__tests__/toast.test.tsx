import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ToastProvider, useToast } from '@/components/ui/toast'

function TestComponent() {
  return <div data-testid="child">Test Child</div>
}

describe('Toast', () => {
  it('renders children', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('provides toast function via context', () => {
    let toastFn: ReturnType<typeof useToast>['toast'] | null = null

    function Consumer() {
      const { toast } = useToast()
      toastFn = toast
      return null
    }

    render(
      <ToastProvider>
        <Consumer />
      </ToastProvider>,
    )

    expect(toastFn).toBeDefined()
    expect(typeof toastFn).toBe('function')
  })

  it('useToast returns default context when no provider (no throw)', () => {
    // Toast context has a default value, so it won't throw.
    // This test verifies the default toast function is callable.
    let toastFn: ReturnType<typeof useToast>['toast'] | undefined

    function Consumer() {
      const ctx = useToast()
      toastFn = ctx.toast
      return <span>consumer</span>
    }

    render(<Consumer />)
    expect(toastFn).toBeDefined()
    expect(typeof toastFn).toBe('function')
  })
})
