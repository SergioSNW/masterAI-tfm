import { post } from '../../src/services/api'
import { submitCloudinaryVideo } from '../../src/services/submissionService'
import type { CastingDTO } from '../../src/services/types'

jest.mock('../../src/services/api', () => ({
  post: jest.fn(),
}))

const mockedPost = post as jest.MockedFunction<typeof post>

const casting: CastingDTO = {
  id: 'c1', title: 'Lady Victoria', projectName: 'The Crown', role: 'Lady Victoria', deadline: 'Dec 10, 2026', status: 'open',
}

describe('submissionService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('submitCloudinaryVideo posts the casting, actor, video URL and notes', async () => {
    mockedPost.mockResolvedValue({ id: 's1', status: 'pending', createdAt: '2026-09-01T00:00:00.000Z' })

    const result = await submitCloudinaryVideo(casting, 'https://res.cloudinary.com/demo/video.mp4', 'First take')

    expect(mockedPost).toHaveBeenCalledWith('/submissions', {
      castingId: 'c1', actorId: 'a1', videoUrl: 'https://res.cloudinary.com/demo/video.mp4', notes: 'First take',
    })
    expect(result).toEqual({ id: 's1', status: 'pending', feedback: undefined, submittedAt: '2026-09-01T00:00:00.000Z' })
  })

  it('falls back to a local pending submission when the API call fails', async () => {
    mockedPost.mockRejectedValue(new Error('network down'))

    const result = await submitCloudinaryVideo(casting, 'https://res.cloudinary.com/demo/video.mp4')

    expect(result.id).toMatch(/^local-/)
    expect(result.status).toBe('pending')
    expect(result.submittedAt).toBeTruthy()
  })
})
