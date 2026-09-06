import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as api from '../../services/api'
import { createRound, openRound, closeRound } from '../../services/roundService'

vi.mock('../../services/api', () => ({
  post: vi.fn(),
}))

describe('roundService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('createRound posts the round fields', async () => {
    vi.mocked(api.post).mockResolvedValue({ id: 'r1' })

    await createRound({ castingId: 'c1', name: 'Self-Tape Submission', order: 0 })

    expect(api.post).toHaveBeenCalledWith('/rounds/create', { castingId: 'c1', name: 'Self-Tape Submission', order: 0 })
  })

  it('openRound posts only the roundId', async () => {
    vi.mocked(api.post).mockResolvedValue({ id: 'r1', status: 'open' })

    await openRound('r1')

    expect(api.post).toHaveBeenCalledWith('/rounds/open', { roundId: 'r1' })
  })

  it('closeRound posts only the roundId', async () => {
    vi.mocked(api.post).mockResolvedValue({ id: 'r1', status: 'closed' })

    await closeRound('r1')

    expect(api.post).toHaveBeenCalledWith('/rounds/close', { roundId: 'r1' })
  })
})
