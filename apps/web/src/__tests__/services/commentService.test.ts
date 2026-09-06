import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as api from '../../services/api'
import { fetchComments, createComment } from '../../services/commentService'
import type { CommentDTO } from '../../services/commentService'

vi.mock('../../services/api', () => ({
  get: vi.fn(),
  post: vi.fn(),
}))

const serverComment: CommentDTO = {
  id: 'cm1', submissionId: 's1', authorName: 'Demo Director', content: 'Great energy in this take.',
  createdAt: '2026-09-01T00:00:00.000Z',
}

describe('commentService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchComments returns server data scoped to the submission', async () => {
    vi.mocked(api.get).mockResolvedValue([serverComment])

    const result = await fetchComments('s1')

    expect(api.get).toHaveBeenCalledWith('/submissions/comments?submissionId=s1')
    expect(result).toEqual([serverComment])
  })

  it('fetchComments falls back to the local cache when the API fails', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([serverComment])
    await fetchComments('s1')

    vi.mocked(api.get).mockRejectedValueOnce(new Error('network down'))
    const result = await fetchComments('s1')

    expect(result).toEqual([serverComment])
  })

  it('createComment returns the server-created comment on success', async () => {
    vi.mocked(api.post).mockResolvedValue(serverComment)

    const result = await createComment({ submissionId: 's1', authorName: 'Demo Director', content: 'Great energy in this take.' })

    expect(result).toEqual(serverComment)
  })

  it('createComment falls back to a local optimistic comment when the API call fails', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('network down'))

    const result = await createComment({ submissionId: 's1', authorName: 'Demo Director', content: 'Offline note' })

    expect(result.id).toMatch(/^local-/)
    expect(result.content).toBe('Offline note')
  })
})
