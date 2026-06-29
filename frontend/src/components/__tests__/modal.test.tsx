import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from '@/components/ui/modal'

describe('Modal', () => {
  it('does not render when closed', () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="Test Modal">
        <p>Content</p>
      </Modal>,
    )
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
  })

  it('renders when open', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Test Modal">
        <p>Modal content here</p>
      </Modal>,
    )
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal content here')).toBeInTheDocument()
  })

  it('renders submit button when onSubmit is provided', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Test" onSubmit={vi.fn()} submitLabel="Save Changes">
        <p>Content</p>
      </Modal>,
    )
    expect(screen.getByText('Save Changes')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('does not render submit button when onSubmit is not provided', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Test">
        <p>Content</p>
      </Modal>,
    )
    expect(screen.queryByText('Save')).not.toBeInTheDocument()
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
  })

  it('calls onClose when Cancel is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose} title="Test" onSubmit={vi.fn()}>
        <p>Content</p>
      </Modal>,
    )
    await user.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onSubmit when submit button is clicked', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <Modal open={true} onClose={vi.fn()} title="Test" onSubmit={onSubmit} submitLabel="Create">
        <p>Content</p>
      </Modal>,
    )
    await user.click(screen.getByText('Create'))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('shows loading state on submit button', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Test" onSubmit={vi.fn()} loading={true} submitLabel="Save">
        <p>Content</p>
      </Modal>,
    )
    expect(screen.getByText('Saving...')).toBeInTheDocument()
  })

  it('displays error message when onSubmit provided', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Test" onSubmit={vi.fn()} error="Something went wrong">
        <p>Content</p>
      </Modal>,
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })
})
