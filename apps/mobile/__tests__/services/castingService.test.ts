import { fetchOpenCastings } from '../../src/services/castingService'

describe('castingService', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('fetchOpenCastings returns an array of castings', async () => {
    const promise = fetchOpenCastings()
    jest.advanceTimersByTime(700)
    const castings = await promise
    expect(Array.isArray(castings)).toBe(true)
    expect(castings.length).toBeGreaterThan(0)
  })

  it('each casting has required fields', async () => {
    const promise = fetchOpenCastings()
    jest.advanceTimersByTime(700)
    const castings = await promise
    for (const c of castings) {
      expect(c).toHaveProperty('id')
      expect(c).toHaveProperty('title')
      expect(c).toHaveProperty('projectName')
      expect(c).toHaveProperty('role')
      expect(c).toHaveProperty('deadline')
      expect(c).toHaveProperty('status')
    }
  })

  it('returns castings with submissions when present', async () => {
    const promise = fetchOpenCastings()
    jest.advanceTimersByTime(700)
    const castings = await promise
    const withSubmission = castings.filter(c => c.submission)
    expect(withSubmission.length).toBeGreaterThanOrEqual(1)
    expect(withSubmission[0].submission).toHaveProperty('status')
  })
})
