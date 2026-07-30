import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActorProvider, useActorContext } from '../../context/ActorContext'
import { ActorListView } from '../../components/ActorListView'
import * as actorService from '../../services/actorService'
import type { ActorDTO } from '../../services/actorService'

vi.mock('../../services/actorService', () => ({
  fetchActors: vi.fn(),
  createActor: vi.fn(),
  updateActor: vi.fn(),
  deleteActor: vi.fn(),
}))

const mockActors: ActorDTO[] = [
  { id: '1', email: 'alice@test.com', name: 'Alice Johnson', phone: '+44 123', availability: 'Available', castingStage: 'First Round', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: '2', email: 'bob@test.com', name: 'Bob Smith', availability: 'Available', castingStage: 'Pending', createdAt: '2026-01-02', updatedAt: '2026-01-02' },
]

describe('ActorListView - Action Menu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(actorService.fetchActors).mockResolvedValue(mockActors)
  })

  it('renders the action menu trigger on each row', async () => {
    render(
      <ActorProvider>
        <ActorListView />
      </ActorProvider>
    )
    const triggers = await screen.findAllByRole('button', { name: '' })
    expect(triggers.length).toBeGreaterThanOrEqual(2)
  })

  it('opens dropdown when action menu trigger is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ActorProvider>
        <ActorListView />
      </ActorProvider>
    )

    await screen.findByText('Alice Johnson')

    const triggers = document.querySelectorAll('.action-menu-trigger')
    await user.click(triggers[0])

    expect(screen.getByText('Casting Stage')).toBeInTheDocument()
    expect(screen.getAllByText('Pending').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Callback')).toBeInTheDocument()
    expect(screen.getByText('Casted')).toBeInTheDocument()
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('calls updateActor when a stage is clicked', async () => {
    vi.mocked(actorService.updateActor).mockResolvedValue(mockActors[0])
    const user = userEvent.setup()

    render(
      <ActorProvider>
        <ActorListView />
      </ActorProvider>
    )

    await screen.findByText('Alice Johnson')
    const triggers = document.querySelectorAll('.action-menu-trigger')
    await user.click(triggers[0])
    await user.click(screen.getByText('Casted'))

    expect(vi.mocked(actorService.updateActor)).toHaveBeenCalledWith(
      expect.objectContaining({ id: '1', castingStage: 'Casted' })
    )
  })

  it('calls deleteActor when Delete is confirmed', async () => {
    vi.mocked(actorService.deleteActor).mockResolvedValue(undefined)
    const user = userEvent.setup()

    render(
      <ActorProvider>
        <ActorListView />
      </ActorProvider>
    )

    await screen.findByText('Alice Johnson')
    const triggers = document.querySelectorAll('.action-menu-trigger')
    await user.click(triggers[0])

    vi.spyOn(window, 'confirm').mockReturnValue(true)
    await user.click(screen.getByText('Delete'))

    expect(vi.mocked(actorService.deleteActor)).toHaveBeenCalledWith('1')
  })
})
