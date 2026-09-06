import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as api from '../../services/api'
import { createCasting, fetchOpenCastings, updateCastingPhase } from '../../services/castingService'

vi.mock('../../services/api', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
}))

describe('castingService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('createCasting posts the input as-is', async () => {
    vi.mocked(api.post).mockResolvedValue({ id: 'c1' })

    await createCasting({ projectId: 'p1', roleName: 'Lady Victoria', requirements: 'British accent' })

    expect(api.post).toHaveBeenCalledWith('/castings/create', { projectId: 'p1', roleName: 'Lady Victoria', requirements: 'British accent' })
  })

  it('fetchOpenCastings URL-encodes the actorId', async () => {
    vi.mocked(api.get).mockResolvedValue([])

    await fetchOpenCastings('actor id/with-special+chars')

    expect(api.get).toHaveBeenCalledWith('/castings?actorId=actor%20id%2Fwith-special%2Bchars')
  })

  it('updateCastingPhase PUTs the new phase', async () => {
    vi.mocked(api.put).mockResolvedValue({ id: 'c1', activePhase: 'Callbacks' })

    await updateCastingPhase('c1', 'Callbacks')

    expect(api.put).toHaveBeenCalledWith('/castings/c1/phase', { activePhase: 'Callbacks' })
  })
})
