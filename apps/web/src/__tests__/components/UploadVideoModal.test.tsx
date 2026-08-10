import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UploadVideoModal } from '../../components/UploadVideoModal'
import * as actorService from '../../services/actorService'
import * as submissionService from '../../services/submissionService'
import * as cloudinaryService from '../../services/cloudinaryService'

vi.mock('../../services/actorService', () => ({
  fetchActors: vi.fn(),
}))

vi.mock('../../services/submissionService', () => ({
  createSubmission: vi.fn(),
  uploadVideo: vi.fn(),
}))

vi.mock('../../services/cloudinaryService', () => ({
  getCloudinarySignature: vi.fn(),
  uploadVideoToCloudinary: vi.fn(),
}))

const mockActors = [
  { id: '1', name: 'Alice Wonder', email: 'alice@test.com', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: '2', name: 'Bob Builder', email: 'bob@test.com', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
]

const mockFile = new File(['test'], 'audition.mp4', { type: 'video/mp4' })

describe('UploadVideoModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(actorService.fetchActors).mockResolvedValue(mockActors)
  })

  it('renders title and loads actors in director mode', async () => {
    render(<UploadVideoModal castingId="c1" onClose={vi.fn()} onSuccess={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /upload video/i })).toBeInTheDocument()
    expect(await screen.findByText('Alice Wonder')).toBeInTheDocument()
    expect(screen.getByText('Bob Builder')).toBeInTheDocument()
  })

  it('filters actors by search', async () => {
    const user = userEvent.setup()
    render(<UploadVideoModal castingId="c1" onClose={vi.fn()} onSuccess={vi.fn()} />)
    expect(await screen.findByText('Alice Wonder')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText('Search actors...')
    await user.type(searchInput, 'Bob')
    expect(screen.queryByText('Alice Wonder')).not.toBeInTheDocument()
    expect(screen.getByText('Bob Builder')).toBeInTheDocument()
  })

  it('selects an actor and shows change button', async () => {
    const user = userEvent.setup()
    render(<UploadVideoModal castingId="c1" onClose={vi.fn()} onSuccess={vi.fn()} />)
    await user.click(await screen.findByText('Alice Wonder'))

    expect(screen.getByText('alice@test.com')).toBeInTheDocument()
    expect(screen.getByText('Change')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Search actors...')).not.toBeInTheDocument()
  })

  it('calls onClose when cancel is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<UploadVideoModal castingId="c1" onClose={onClose} onSuccess={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('hides actor picker when actorId is provided', () => {
    render(<UploadVideoModal castingId="c1" actorId="a1" onClose={vi.fn()} onSuccess={vi.fn()} />)
    expect(screen.queryByPlaceholderText('Search actors...')).not.toBeInTheDocument()
  })

  it('uploads via Cloudinary and creates a submission when actorId is provided', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    const onClose = vi.fn()

    vi.mocked(cloudinaryService.getCloudinarySignature).mockResolvedValue({
      signature: 'sig', timestamp: 123, folder: 'actor_auditions', apiKey: 'key', cloudName: 'cloud',
    })
    vi.mocked(cloudinaryService.uploadVideoToCloudinary).mockResolvedValue('https://res.cloudinary.com/cloud/video.mp4')
    vi.mocked(submissionService.createSubmission).mockResolvedValue({
      id: 's1', castingId: 'c1', actorId: 'a1', videoUrl: 'https://res.cloudinary.com/cloud/video.mp4',
      status: 'pending', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
    })

    render(<UploadVideoModal castingId="c1" actorId="a1" onClose={onClose} onSuccess={onSuccess} />)

    await user.upload(screen.getByLabelText(/video file/i), mockFile)
    await user.click(screen.getByRole('button', { name: /upload video/i }))

    await waitFor(() => {
      expect(cloudinaryService.getCloudinarySignature).toHaveBeenCalledTimes(1)
      expect(cloudinaryService.uploadVideoToCloudinary).toHaveBeenCalledWith(
        mockFile,
        { signature: 'sig', timestamp: 123, folder: 'actor_auditions', apiKey: 'key', cloudName: 'cloud' },
      )
      expect(submissionService.createSubmission).toHaveBeenCalledWith({
        castingId: 'c1',
        actorId: 'a1',
        videoUrl: 'https://res.cloudinary.com/cloud/video.mp4',
        notes: undefined,
      })
      expect(onSuccess).toHaveBeenCalledTimes(1)
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })
})
