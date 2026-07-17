import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UploadVideoModal } from '../../components/UploadVideoModal'
import * as actorService from '../../services/actorService'

vi.mock('../../services/actorService', () => ({
  fetchActors: vi.fn(),
}))

vi.mock('../../services/submissionService', () => ({
  uploadVideo: vi.fn(),
}))

const mockActors = [
  { id: '1', name: 'Alice Wonder', email: 'alice@test.com', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: '2', name: 'Bob Builder', email: 'bob@test.com', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
]

describe('UploadVideoModal', () => {
  beforeEach(() => {
    vi.mocked(actorService.fetchActors).mockResolvedValue(mockActors)
  })

  it('renders title and loads actors', async () => {
    render(<UploadVideoModal roundId="r1" onClose={vi.fn()} onSuccess={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /upload video/i })).toBeInTheDocument()
    expect(await screen.findByText('Alice Wonder')).toBeInTheDocument()
    expect(screen.getByText('Bob Builder')).toBeInTheDocument()
  })

  it('filters actors by search', async () => {
    const user = userEvent.setup()
    render(<UploadVideoModal roundId="r1" onClose={vi.fn()} onSuccess={vi.fn()} />)
    expect(await screen.findByText('Alice Wonder')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Search actors...')
    await user.type(searchInput, 'Bob')
    expect(screen.queryByText('Alice Wonder')).not.toBeInTheDocument()
    expect(screen.getByText('Bob Builder')).toBeInTheDocument()
  })

  it('selects an actor and shows change button', async () => {
    const user = userEvent.setup()
    render(<UploadVideoModal roundId="r1" onClose={vi.fn()} onSuccess={vi.fn()} />)
    await user.click(await screen.findByText('Alice Wonder'))

    expect(screen.getByText('alice@test.com')).toBeInTheDocument()
    expect(screen.getByText('Change')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Search actors...')).not.toBeInTheDocument()
  })

  it('calls onClose when cancel is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<UploadVideoModal roundId="r1" onClose={onClose} onSuccess={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
