import { fetchComments } from '../../src/services/commentService'

describe('commentService', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns comments for shortlisted status', async () => {
    const promise = fetchComments('shortlisted')
    jest.advanceTimersByTime(400)
    const comments = await promise
    expect(comments.length).toBe(2)
    expect(comments[0]).toHaveProperty('authorName')
    expect(comments[0]).toHaveProperty('content')
  })

  it('returns comments for reviewed status', async () => {
    const promise = fetchComments('reviewed')
    jest.advanceTimersByTime(400)
    const comments = await promise
    expect(comments.length).toBe(1)
  })

  it('returns comments for rejected status', async () => {
    const promise = fetchComments('rejected')
    jest.advanceTimersByTime(400)
    const comments = await promise
    expect(comments.length).toBe(1)
  })

  it('returns empty array for unknown status', async () => {
    const promise = fetchComments('unknown')
    jest.advanceTimersByTime(400)
    const comments = await promise
    expect(comments).toEqual([])
  })
})
