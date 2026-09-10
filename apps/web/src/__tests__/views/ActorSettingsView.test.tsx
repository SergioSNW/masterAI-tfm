import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActorSettingsView } from '../../views/ActorSettingsView'
import * as actorService from '../../services/actorService'
import type { ActorDTO } from '../../services/actorService'

vi.mock('../../services/actorService', () => ({
  fetchActor: vi.fn(),
  updateActor: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const actor: ActorDTO = {
  id: 'a1', email: 'emma.r@example.com', name: 'Emma Richardson', phone: '+1 555 0100',
  bio: 'Stage and screen actress.', agency: 'Skywalker Talent', availability: 'Available', castingStage: 'Pending',
  createdAt: '2026-01-01', updatedAt: '2026-01-01',
}

describe('ActorSettingsView', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads and displays the actor\'s own profile fields', async () => {
    vi.mocked(actorService.fetchActor).mockResolvedValue(actor)

    render(<ActorSettingsView />)

    expect(await screen.findByDisplayValue('Emma Richardson')).toBeInTheDocument()
    expect(screen.getByDisplayValue('emma.r@example.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('+1 555 0100')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Skywalker Talent')).toBeInTheDocument()
  })

  it('shows an error state when the profile fails to load', async () => {
    vi.mocked(actorService.fetchActor).mockRejectedValue(new Error('Actor not found'))

    render(<ActorSettingsView />)

    expect(await screen.findByText('Actor not found')).toBeInTheDocument()
  })

  it('saves edited fields through updateActor', async () => {
    vi.mocked(actorService.fetchActor).mockResolvedValue(actor)
    vi.mocked(actorService.updateActor).mockResolvedValue({ ...actor, name: 'Emma R. Richardson' })
    const user = userEvent.setup()

    render(<ActorSettingsView />)
    const nameInput = await screen.findByDisplayValue('Emma Richardson')

    await user.clear(nameInput)
    await user.type(nameInput, 'Emma R. Richardson')
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(actorService.updateActor).toHaveBeenCalledWith(expect.objectContaining({
        id: 'a1',
        name: 'Emma R. Richardson',
      }))
    })
  })
})
