import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PageHeader } from '@/components/page-header'

describe('PageHeader', () => {
  it('renders title', () => {
    render(<PageHeader title="Dashboard" />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders eyebrow above title', () => {
    render(<PageHeader eyebrow="Overview" title="Dashboard" />)
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(
      <PageHeader
        title="Dashboard"
        description="View your finances"
      />,
    )
    expect(screen.getByText('View your finances')).toBeInTheDocument()
  })

  it('renders children (action buttons)', () => {
    render(
      <PageHeader title="Dashboard">
        <button>Add New</button>
      </PageHeader>,
    )
    expect(screen.getByText('Add New')).toBeInTheDocument()
  })

  it('renders all props together', () => {
    render(
      <PageHeader
        eyebrow="Finance"
        title="Net Worth"
        description="Your total assets minus liabilities"
      >
        <button>Export</button>
      </PageHeader>,
    )

    expect(screen.getByText('Finance')).toBeInTheDocument()
    expect(screen.getByText('Net Worth')).toBeInTheDocument()
    expect(screen.getByText('Your total assets minus liabilities')).toBeInTheDocument()
    expect(screen.getByText('Export')).toBeInTheDocument()
  })
})
