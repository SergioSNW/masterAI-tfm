import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActorProvider, useActorContext } from '../../context/ActorContext'
import * as actorService from '../../services/actorService'
import type { ActorDTO } from '../../services/actorService'

vi.mock('../../services/actorService', () => ({
  fetchActors: vi.fn(),
  createActor: vi.fn(),
  updateActor: vi.fn(),
  deleteActor: vi.fn(),
}))

const mockActors: ActorDTO[] = [
  { id: '1', email: 'alice@test.com', name: 'Alice', availability: 'Available', castingStage: 'Pending', createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: '2', email: 'bob@test.com', name: 'Bob', availability: 'Available', castingStage: 'First Round', createdAt: '2026-01-02', updatedAt: '2026-01-02' },
]

function TestHarness() {
  const ctx = useActorContext()
  return (
    <div>
      <div data-testid="count">{ctx.actors.length}</div>
      <div data-testid="names">{ctx.actors.map(a => a.name).join(',')}</div>
      <div data-testid="loading">{ctx.loading ? 'loading' : 'done'}</div>
      <button data-testid="create" onClick={() => ctx.createActor({ name: 'Charlie', email: 'charlie@test.com' }).catch(() => {})}>Create</button>
      <button data-testid="update" onClick={() => ctx.updateActor({ id: '1', name: 'Alice Updated' }).catch(() => {})}>Update</button>
      <button data-testid="delete" onClick={() => ctx.deleteActor('1')}>Delete</button>
    </div>
  )
}

describe('ActorContext optimistic updates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(actorService.fetchActors).mockResolvedValue(mockActors)
  })

  it('loads actors on mount', async () => {
    render(<ActorProvider><TestHarness /></ActorProvider>)
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('2'))
    expect(screen.getByTestId('names')).toHaveTextContent('Alice,Bob')
  })

  it('creates actor and replaces optimistic with server data', async () => {
    const created: ActorDTO = { id: '3', email: 'charlie@test.com', name: 'Charlie', availability: 'Available', castingStage: 'Pending', createdAt: '2026-03-01', updatedAt: '2026-03-01' }
    vi.mocked(actorService.createActor).mockResolvedValue(created)
    const user = userEvent.setup()

    render(<ActorProvider><TestHarness /></ActorProvider>)
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('2'))

    await user.click(screen.getByTestId('create'))

    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('3')
      expect(screen.getByTestId('names').textContent).toContain('Charlie')
    })
  })

  it('reverts optimistic create on failure', async () => {
    vi.mocked(actorService.createActor).mockRejectedValue(new Error('Network error'))
    const user = userEvent.setup()

    render(<ActorProvider><TestHarness /></ActorProvider>)
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('2'))

    await user.click(screen.getByTestId('create'))

    await waitFor(() => {
      expect(screen.getByTestId('count')).toHaveTextContent('2')
      expect(screen.getByTestId('names').textContent).not.toContain('Charlie')
    })
  })

  it('updates actor and applies server response', async () => {
    const updated: ActorDTO = { id: '1', email: 'alice@test.com', name: 'Alice Updated', availability: 'Available', castingStage: 'Pending', createdAt: '2026-01-01', updatedAt: '2026-03-01' }
    vi.mocked(actorService.updateActor).mockResolvedValue(updated)
    const user = userEvent.setup()

    render(<ActorProvider><TestHarness /></ActorProvider>)
    await waitFor(() => expect(screen.getByTestId('names')).toHaveTextContent('Alice,Bob'))

    await user.click(screen.getByTestId('update'))

    await waitFor(() => {
      expect(screen.getByTestId('names')).toHaveTextContent('Alice Updated,Bob')
    })
  })

  it('reverts optimistic update on failure', async () => {
    vi.mocked(actorService.updateActor).mockRejectedValue(new Error('Network error'))
    const user = userEvent.setup()

    render(<ActorProvider><TestHarness /></ActorProvider>)
    await waitFor(() => expect(screen.getByTestId('names')).toHaveTextContent('Alice,Bob'))

    await user.click(screen.getByTestId('update'))

    await waitFor(() => {
      expect(screen.getByTestId('names')).toHaveTextContent('Alice,Bob')
    })
  })

  it('restores actor on delete failure', async () => {
    vi.mocked(actorService.deleteActor).mockRejectedValue(new Error('Network error'))
    const user = userEvent.setup()

    render(<ActorProvider><TestHarness /></ActorProvider>)
    await waitFor(() => expect(screen.getByTestId('names')).toHaveTextContent('Alice,Bob'))

    await user.click(screen.getByTestId('delete'))

    await waitFor(() => {
      expect(screen.getByTestId('names')).toHaveTextContent('Alice,Bob')
    })
  })

  it('deletes actor successfully', async () => {
    vi.mocked(actorService.deleteActor).mockResolvedValue(undefined)
    const user = userEvent.setup()

    render(<ActorProvider><TestHarness /></ActorProvider>)
    await waitFor(() => expect(screen.getByTestId('names')).toHaveTextContent('Alice,Bob'))

    await user.click(screen.getByTestId('delete'))

    await waitFor(() => {
      expect(screen.getByTestId('names')).toHaveTextContent('Bob')
    })
  })
})
