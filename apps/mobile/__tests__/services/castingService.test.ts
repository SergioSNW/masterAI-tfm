import { get } from '../../src/services/api'
import { fetchOpenCastings } from '../../src/services/castingService'

jest.mock('../../src/services/api', () => ({
  get: jest.fn(),
}))

const mockedGet = get as jest.MockedFunction<typeof get>

const mockCastings = [
  {
    id: 'c1',
    title: 'Lead Role — Feature Film',
    projectName: 'Eclipse',
    role: 'Lead Actor',
    deadline: '2026-08-15T00:00:00.000Z',
    status: 'open',
    roundId: 'r1',
    submission: { status: 'shortlisted', feedback: 'Great presence.', submittedAt: '2026-07-01T00:00:00.000Z' },
  },
  {
    id: 'c2',
    title: 'Supporting Role',
    projectName: 'Eclipse',
    role: 'Supporting Actor',
    deadline: '2026-09-01T00:00:00.000Z',
    status: 'open',
    roundId: 'r2',
  },
]

describe('castingService', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    mockedGet.mockResolvedValue(mockCastings)
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
