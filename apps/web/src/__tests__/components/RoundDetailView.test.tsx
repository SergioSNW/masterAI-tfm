import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RoundDetailView } from '../../views/RoundDetailView'
import type { Round } from '../../data/mock'
import * as commentService from '../../services/commentService'
import * as attachmentService from '../../services/attachmentService'

vi.mock('../../services/commentService', () => ({
  fetchComments: vi.fn(),
  createComment: vi.fn(),
}))

vi.mock('../../services/attachmentService', () => ({
  fetchAttachments: vi.fn(),
  addAttachment: vi.fn(),
  downloadAttachment: vi.fn(),
}))

const mockSubmissions = [
  { id: 's1', actorId: 'a1', actorName: 'Emma Richardson', actorEmail: 'emma@test.com', avatarColor: '#6366f1', videoUrl: '#', status: 'pending' as const, notes: 'Strong', createdAt: '2026-07-10' },
  { id: 's2', actorId: 'a2', actorName: 'James Whitfield', actorEmail: 'james@test.com', avatarColor: '#a855f7', videoUrl: '#', status: 'shortlisted' as const, feedback: 'Excellent', createdAt: '2026-07-11' },
]

const mockRound: Round = {
  id: 'r1',
  castingId: 'c1',
  name: 'Self-Tape Submission',
  description: 'Submit a 2-minute monologue',
  deadline: '2026-08-15T23:59:59Z',
  order: 0,
  status: 'open',
  submissions: mockSubmissions,
}

describe('RoundDetailView', () => {
  beforeEach(() => {
    vi.mocked(commentService.fetchComments).mockResolvedValue([])
    vi.mocked(attachmentService.fetchAttachments).mockResolvedValue([])
  })

  it('renders round name and description', () => {
    render(<RoundDetailView round={mockRound} onBack={vi.fn()} />)
    expect(screen.getByText('Self-Tape Submission')).toBeInTheDocument()
    expect(screen.getByText('Submit a 2-minute monologue')).toBeInTheDocument()
  })

  it('shows submission count stats', () => {
    render(<RoundDetailView round={mockRound} onBack={vi.fn()} />)
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(2)
  })

  it('renders all submissions in the list', () => {
    render(<RoundDetailView round={mockRound} onBack={vi.fn()} />)
    expect(screen.getByText('Emma Richardson')).toBeInTheDocument()
    expect(screen.getByText('James Whitfield')).toBeInTheDocument()
  })

  it('shows status badges on submissions', () => {
    render(<RoundDetailView round={mockRound} onBack={vi.fn()} />)
    expect(screen.getByText('pending')).toBeInTheDocument()
    expect(screen.getByText('shortlisted')).toBeInTheDocument()
  })

  it('opens review modal when a submission is clicked', async () => {
    const user = userEvent.setup()
    render(<RoundDetailView round={mockRound} onBack={vi.fn()} />)

    await user.click(screen.getByText('Emma Richardson'))
    expect(screen.getByText('emma@test.com')).toBeInTheDocument()
    expect(screen.getByText('Notes')).toBeInTheDocument()
    expect(screen.getByText('Strong')).toBeInTheDocument()
  })

  it('shows action buttons in review modal', async () => {
    const user = userEvent.setup()
    render(<RoundDetailView round={mockRound} onBack={vi.fn()} />)

    await user.click(screen.getByText('Emma Richardson'))
    expect(screen.getByRole('button', { name: /shortlist/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mark reviewed/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument()
  })

  it('loads and displays attachments section', async () => {
    vi.mocked(attachmentService.fetchAttachments).mockResolvedValue([
      { id: 'a1', roundId: 'r1', fileName: 'script.pdf', fileType: 'application/pdf', url: 'https://blob.vercel.storage.com/file.pdf', fileSize: 50000, createdAt: '2026-07-01' },
    ])

    render(<RoundDetailView round={mockRound} onBack={vi.fn()} />)
    expect(await screen.findByText('script.pdf')).toBeInTheDocument()
    expect(screen.getByText(/48\.8 KB/)).toBeInTheDocument()
  })

  it('shows upload prompt when no attachments', async () => {
    render(<RoundDetailView round={mockRound} onBack={vi.fn()} />)
    expect(await screen.findByText(/Drag.*drop/)).toBeInTheDocument()
    expect(screen.getByText(/Max 50 MB/)).toBeInTheDocument()
  })

  it('renders the drop zone on open rounds', async () => {
    render(<RoundDetailView round={mockRound} onBack={vi.fn()} />)
    expect(await screen.findByText(/Drag.*drop/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /upload file/i })).toBeInTheDocument()
  })

  it('hides the drop zone on closed rounds', async () => {
    const closedRound = { ...mockRound, status: 'closed' as const }
    render(<RoundDetailView round={closedRound} onBack={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /upload file/i })).not.toBeInTheDocument()
  })

  it('calls onBack when back button is clicked', async () => {
    const onBack = vi.fn()
    const user = userEvent.setup()
    render(<RoundDetailView round={mockRound} onBack={onBack} />)

    await user.click(screen.getByText(/← Back to Casting/))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('calls onReview when shortlist is clicked', async () => {
    const onReview = vi.fn()
    const user = userEvent.setup()
    render(<RoundDetailView round={mockRound} onBack={vi.fn()} onReview={onReview} />)

    await user.click(screen.getByText('Emma Richardson'))
    await user.click(screen.getByRole('button', { name: /shortlist/i }))
    expect(onReview).toHaveBeenCalledWith('s1', 'shortlisted', undefined)
  })

  it('shows an Open Round button for pending rounds', async () => {
    const pendingRound = { ...mockRound, status: 'pending' as const }
    const user = userEvent.setup()
    render(<RoundDetailView round={pendingRound} onBack={vi.fn()} />)

    const openBtn = screen.getByRole('button', { name: /open round/i })
    await user.click(openBtn)
    expect(openBtn).toBeInTheDocument()
  })

  it('shows a Close Round button for open rounds', async () => {
    render(<RoundDetailView round={mockRound} onBack={vi.fn()} />)
    expect(screen.getByRole('button', { name: /close round/i })).toBeInTheDocument()
  })

  it('calls onRoundStatusChange when Open Round is clicked', async () => {
    const onRoundStatusChange = vi.fn()
    const user = userEvent.setup()
    const pendingRound = { ...mockRound, status: 'pending' as const }
    render(<RoundDetailView round={pendingRound} onBack={vi.fn()} onRoundStatusChange={onRoundStatusChange} />)

    await user.click(screen.getByRole('button', { name: /open round/i }))
    expect(onRoundStatusChange).toHaveBeenCalledWith('r1', 'open')
  })

  it('calls onRoundStatusChange when Close Round is clicked', async () => {
    const onRoundStatusChange = vi.fn()
    const user = userEvent.setup()
    render(<RoundDetailView round={mockRound} onBack={vi.fn()} onRoundStatusChange={onRoundStatusChange} />)

    await user.click(screen.getByRole('button', { name: /close round/i }))
    expect(onRoundStatusChange).toHaveBeenCalledWith('r1', 'closed')
  })

  it('does not render Open or Close Round buttons for closed rounds', () => {
    const closedRound = { ...mockRound, status: 'closed' as const }
    render(<RoundDetailView round={closedRound} onBack={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /open round/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /close round/i })).not.toBeInTheDocument()
  })
})
