import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActorPortalView } from '../../views/ActorPortalView'
import * as castingService from '../../services/castingService'
import * as attachmentService from '../../services/attachmentService'

vi.mock('../../services/castingService', () => ({
  fetchOpenCastings: vi.fn(),
}))

vi.mock('../../services/attachmentService', () => ({
  fetchAttachments: vi.fn(),
}))

vi.mock('../../components/UploadVideoModal', () => ({
  UploadVideoModal: () => <div>Upload Video Modal</div>,
}))

const mockCasting = {
  id: 'c5',
  title: 'Guest — Lady Sarah',
  projectName: 'The Crown — Season 3',
  role: 'Guest — Lady Sarah',
  description: 'A visiting duchess with a hidden agenda at court.',
  requirements: 'British accent, age 35-50',
  deadline: '2026-09-05T23:59:59.000Z',
  status: 'open',
  roundId: 'r5',
  roundStatus: 'open',
  submission: undefined,
}

const mockAttachments = [
  {
    id: 'a1',
    roundId: 'r5',
    fileName: 'lady-sarah-sides.pdf',
    fileType: 'application/pdf',
    url: 'https://example.com/lady-sarah-sides.pdf',
    fileSize: 10240,
    createdAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'a2',
    roundId: 'r5',
    fileName: 'director-script.pdf',
    fileType: 'application/pdf',
    url: 'https://example.com/director-script.pdf',
    fileSize: 20480,
    createdAt: '2026-08-02T00:00:00.000Z',
  },
]

describe('ActorPortalView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(castingService.fetchOpenCastings).mockResolvedValue([mockCasting])
  })

  it('loads and renders open castings', async () => {
    render(<ActorPortalView />)
    expect(await screen.findByRole('heading', { name: 'Guest — Lady Sarah' })).toBeInTheDocument()
  })

  it('renders materials as links that open in a new tab when a casting is selected', async () => {
    const user = userEvent.setup()
    vi.mocked(attachmentService.fetchAttachments).mockResolvedValue(mockAttachments)

    render(<ActorPortalView />)
    await user.click(await screen.findByRole('heading', { name: 'Guest — Lady Sarah' }))

    expect(await screen.findByText('Materials')).toBeInTheDocument()

    const link = screen.getByRole('link', { name: /lady-sarah-sides\.pdf/i })
    expect(link).toHaveAttribute('href', 'https://example.com/lady-sarah-sides.pdf')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')

    expect(screen.getByRole('link', { name: /director-script\.pdf/i })).toHaveAttribute('href', 'https://example.com/director-script.pdf')
  })

  it('shows no Materials section when the round has no attachments', async () => {
    const user = userEvent.setup()
    vi.mocked(attachmentService.fetchAttachments).mockResolvedValue([])

    render(<ActorPortalView />)
    await user.click(await screen.findByRole('heading', { name: 'Guest — Lady Sarah' }))

    expect(await screen.findByText('Requirements:')).toBeInTheDocument()
    expect(screen.queryByText('Materials')).not.toBeInTheDocument()
  })
})
