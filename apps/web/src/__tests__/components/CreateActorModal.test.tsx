import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateActorModal } from '../../components/CreateActorModal'

describe('CreateActorModal', () => {
  it('renders the form fields', () => {
    const { container } = render(<CreateActorModal onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('New Actor')).toBeInTheDocument()
    expect(container.querySelector('input[name="name"]')).toBeInTheDocument()
    expect(container.querySelector('input[name="email"]')).toBeInTheDocument()
  })

  it('calls onSubmit with form data', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    const { container } = render(<CreateActorModal onSubmit={onSubmit} onClose={vi.fn()} />)

    const nameInput = container.querySelector('input[name="name"]')!
    const emailInput = container.querySelector('input[name="email"]')!
    await user.type(nameInput, 'Jane Doe')
    await user.type(emailInput, 'jane@test.com')
    await user.click(screen.getByRole('button', { name: /create actor/i }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Jane Doe', email: 'jane@test.com' })
    )
  })

  it('calls onClose when cancel is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<CreateActorModal onSubmit={vi.fn()} onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when overlay is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    const { container } = render(<CreateActorModal onSubmit={vi.fn()} onClose={onClose} />)

    await user.click(container.querySelector('.modal-overlay')!)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
