import { get } from '../../src/services/api'
import { fetchComments } from '../../src/services/commentService'

jest.mock('../../src/services/api', () => ({
  get: jest.fn(),
}))

const mockedGet = get as jest.MockedFunction<typeof get>

const mockComments = [
  { id: 'c1', submissionId: 's1', authorName: 'Demo Director', content: 'Excellent presence and emotional range.', createdAt: '2026-07-11T00:00:00.000Z' },
  { id: 'c2', submissionId: 's1', authorName: 'Casting Assistant', content: 'Agreed. Strong candidate for the lead role.', createdAt: '2026-07-12T00:00:00.000Z' },
]

describe('commentService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetchComments requests comments for the given submission', async () => {
    mockedGet.mockResolvedValue(mockComments)

    const comments = await fetchComments('s1')

    expect(mockedGet).toHaveBeenCalledWith('/submissions/comments?submissionId=s1')
    expect(comments).toEqual(mockComments)
    expect(comments[0]).toHaveProperty('authorName')
    expect(comments[0]).toHaveProperty('content')
  })

  it('URL-encodes the submission id', async () => {
    mockedGet.mockResolvedValue([])

    await fetchComments('submission/with special')

    expect(mockedGet).toHaveBeenCalledWith('/submissions/comments?submissionId=submission%2Fwith%20special')
  })

  it('returns an empty array when there are no comments', async () => {
    mockedGet.mockResolvedValue([])

    const comments = await fetchComments('s-no-comments')

    expect(comments).toEqual([])
  })

  it('propagates a rejection when the request fails', async () => {
    mockedGet.mockRejectedValue(new Error('network down'))

    await expect(fetchComments('s1')).rejects.toThrow('network down')
  })
})
