import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as api from '../../services/api'
import { createSubmission, uploadVideo, reviewSubmission, analyzeSubmission } from '../../services/submissionService'

vi.mock('../../services/api', () => ({
  post: vi.fn(),
}))

describe('submissionService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('createSubmission posts to /submissions with a Cloudinary video URL', async () => {
    vi.mocked(api.post).mockResolvedValue({ id: 's1' })

    await createSubmission({ castingId: 'c1', actorId: 'a1', videoUrl: 'https://res.cloudinary.com/demo/video.mp4' })

    expect(api.post).toHaveBeenCalledWith('/submissions', { castingId: 'c1', actorId: 'a1', videoUrl: 'https://res.cloudinary.com/demo/video.mp4' })
  })

  it('uploadVideo posts to the legacy Base64 manual-upload endpoint', async () => {
    vi.mocked(api.post).mockResolvedValue({ id: 's1' })

    await uploadVideo({ roundId: 'r1', actorId: 'a1', videoData: 'base64data', fileName: 'tape.mp4' })

    expect(api.post).toHaveBeenCalledWith('/submissions/upload', { roundId: 'r1', actorId: 'a1', videoData: 'base64data', fileName: 'tape.mp4' })
  })

  it('reviewSubmission posts the review decision and resolves with no return value', async () => {
    vi.mocked(api.post).mockResolvedValue({ id: 's1', status: 'shortlisted' })

    const result = await reviewSubmission({ submissionId: 's1', status: 'shortlisted', feedback: 'Great take' })

    expect(api.post).toHaveBeenCalledWith('/submissions/review', { submissionId: 's1', status: 'shortlisted', feedback: 'Great take' })
    expect(result).toBeUndefined()
  })

  it('analyzeSubmission extracts only the AI fields from the response', async () => {
    vi.mocked(api.post).mockResolvedValue({
      id: 's1', roundId: 'r1', actorId: 'a1', videoUrl: 'x', status: 'pending', createdAt: 'now',
      transcript: 'Hello there', aiScore: 91, aiFeedback: 'Confident delivery',
    })

    const result = await analyzeSubmission({ submissionId: 's1' })

    expect(api.post).toHaveBeenCalledWith('/analyze', { submissionId: 's1' })
    expect(result).toEqual({ transcript: 'Hello there', aiScore: 91, aiFeedback: 'Confident delivery' })
  })
})
