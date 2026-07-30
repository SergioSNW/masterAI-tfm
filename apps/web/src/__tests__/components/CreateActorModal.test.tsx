import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateActorModal } from '../../components/CreateActorModal'

describe('CreateActorModal', () => {
  it('renders all form fields', () => {
    render(<CreateActorModal onSubmit={vi.fn()} onClose={vi.fn()} />)

    expect(screen.getByText('New Actor')).toBeInTheDocument()
    expect(screen.getByText('Name *')).toBeInTheDocument()
    expect(screen.getByText('Email *')).toBeInTheDocument()
    expect(screen.getByText('Phone')).toBeInTheDocument()
    expect(screen.getByText('Profile Picture URL')).toBeInTheDocument()
    expect(screen.getByText('Bio')).toBeInTheDocument()
    expect(screen.getByText('Agency')).toBeInTheDocument()
    expect(screen.getByText('Availability')).toBeInTheDocument()
    expect(screen.getByText('Preferred Roles')).toBeInTheDocument()
    expect(screen.getByText('Casting Stage')).toBeInTheDocument()
  })

  it('submits form with all field values', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(<CreateActorModal onSubmit={onSubmit} onClose={vi.fn()} />)

    await user.type(screen.getByPlaceholderText('Full name'), 'Test Actor')
    await user.type(screen.getByPlaceholderText('actor@example.com'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('+44 123 456 789'), '+44 123')
    await user.type(screen.getByPlaceholderText('Short biography...'), 'A bio')
    await user.type(screen.getByPlaceholderText('e.g. CAA, WME'), 'CAA')

    await user.click(screen.getByText('Create Actor'))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Actor',
        email: 'test@example.com',
        phone: '+44 123',
        bio: 'A bio',
        agency: 'CAA',
        availability: 'Available',
        castingStage: 'Pending',
      })
    )
  })

  it('shows Edit title when initial values provided', () => {
    render(
      <CreateActorModal
        onSubmit={vi.fn()}
        onClose={vi.fn()}
        initial={{ name: 'Existing', email: 'existing@test.com' }}
      />
    )

    expect(screen.getByText('Edit Actor')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Existing')).toBeInTheDocument()
    expect(screen.getByDisplayValue('existing@test.com')).toBeInTheDocument()
  })
})
