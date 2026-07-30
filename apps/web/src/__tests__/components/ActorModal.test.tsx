import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActorProvider, useActorContext } from '../../context/ActorContext'
import { ActorModal } from '../../components/ActorModal'
import * as actorService from '../../services/actorService'
import type { ActorDTO } from '../../services/actorService'

vi.mock('../../services/actorService', () => ({
  fetchActors: vi.fn().mockResolvedValue([]),
  createActor: vi.fn(),
  updateActor: vi.fn(),
  deleteActor: vi.fn(),
}))

const mockActor: ActorDTO = {
  id: '1',
  email: 'alice@test.com',
  name: 'Alice Johnson',
  phone: '+44 123 456',
  profilePictureUrl: 'https://i.pravatar.cc/150?u=alice',
  bio: 'An experienced actress',
  agency: 'CAA',
  availability: 'Available',
  preferredRoles: 'Lead, Supporting',
  castingStage: 'Callback',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-15',
}

function ModalOpener() {
  const { selectActor } = useActorContext()
  return <button data-testid="open-modal" onClick={() => selectActor(mockActor)}>Open</button>
}

describe('ActorModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when no actor selected', () => {
    const { container } = render(
      <ActorProvider>
        <ActorModal />
      </ActorProvider>
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders actor details in view mode when selected', async () => {
    const user = userEvent.setup()
    render(
      <ActorProvider>
        <ModalOpener />
        <ActorModal />
      </ActorProvider>
    )
    await user.click(screen.getByTestId('open-modal'))

    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    expect(screen.getAllByText('alice@test.com').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('+44 123 456')).toBeInTheDocument()
    expect(screen.getByText('An experienced actress')).toBeInTheDocument()
    expect(screen.getByText('CAA')).toBeInTheDocument()
    expect(screen.getAllByText('Available').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Lead, Supporting')).toBeInTheDocument()
    expect(screen.getByText('Callback')).toBeInTheDocument()
  })

  it('toggles to edit mode when Edit button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ActorProvider>
        <ModalOpener />
        <ActorModal />
      </ActorProvider>
    )
    await user.click(screen.getByTestId('open-modal'))
    await user.click(screen.getByText('Edit'))

    expect(screen.getByText('Save Changes')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Alice Johnson')).toBeInTheDocument()
    expect(screen.getByDisplayValue('alice@test.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('+44 123 456')).toBeInTheDocument()
    expect(screen.getByDisplayValue('An experienced actress')).toBeInTheDocument()
    expect(screen.getByDisplayValue('CAA')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Lead, Supporting')).toBeInTheDocument()
  })

  it('calls updateActor on save and returns to view mode', async () => {
    vi.mocked(actorService.updateActor).mockResolvedValue(mockActor)
    const user = userEvent.setup()

    render(
      <ActorProvider>
        <ModalOpener />
        <ActorModal />
      </ActorProvider>
    )
    await user.click(screen.getByTestId('open-modal'))
    await user.click(screen.getByText('Edit'))

    const nameInput = screen.getByDisplayValue('Alice Johnson')
    await user.clear(nameInput)
    await user.type(nameInput, 'Alice Updated')

    await user.click(screen.getByText('Save Changes'))

    expect(vi.mocked(actorService.updateActor)).toHaveBeenCalledWith(
      expect.objectContaining({ id: '1', name: 'Alice Updated' })
    )
  })

  it('closes when overlay is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ActorProvider>
        <ModalOpener />
        <ActorModal />
      </ActorProvider>
    )
    await user.click(screen.getByTestId('open-modal'))
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()

    await user.click(document.querySelector('.modal-overlay')!)
    expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument()
  })
})
