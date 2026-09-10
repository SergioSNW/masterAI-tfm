import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as api from '../../services/api'
import { fetchActors, fetchActor, createActor, updateActor, deleteActor } from '../../services/actorService'
import type { ActorDTO } from '../../services/actorService'

vi.mock('../../services/api', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
}))

const serverActor: ActorDTO = {
  id: 'a1', email: 'alice@test.com', name: 'Alice', availability: 'Available', castingStage: 'Pending',
  createdAt: '2026-01-01', updatedAt: '2026-01-01',
}

describe('actorService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchActors returns server data and passes the search query through', async () => {
    vi.mocked(api.get).mockResolvedValue([serverActor])

    const result = await fetchActors('ali')

    expect(api.get).toHaveBeenCalledWith('/actors?search=ali')
    expect(result).toEqual([serverActor])
  })

  it('fetchActors omits the query string when no search term is given', async () => {
    vi.mocked(api.get).mockResolvedValue([])
    await fetchActors()
    expect(api.get).toHaveBeenCalledWith('/actors')
  })

  it('fetchActor requests a single actor by id', async () => {
    vi.mocked(api.get).mockResolvedValue(serverActor)

    const result = await fetchActor('a1')

    expect(api.get).toHaveBeenCalledWith('/actors/a1')
    expect(result).toEqual(serverActor)
  })

  it('fetchActor propagates a rejection when the actor is not found', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Actor not found'))

    await expect(fetchActor('missing')).rejects.toThrow('Actor not found')
  })

  it('createActor returns the server-created actor on success', async () => {
    vi.mocked(api.post).mockResolvedValue(serverActor)

    const result = await createActor({ email: 'alice@test.com', name: 'Alice' })

    expect(result).toEqual(serverActor)
  })

  it('createActor falls back to a local optimistic actor when the API call fails', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('network down'))

    const result = await createActor({ email: 'bob@test.com', name: 'Bob' })

    expect(result.id).toMatch(/^local-/)
    expect(result.email).toBe('bob@test.com')
    expect(result.availability).toBe('Available')
    expect(result.castingStage).toBe('Pending')
  })

  it('updateActor returns the server response on success', async () => {
    const updated = { ...serverActor, name: 'Alice Updated' }
    vi.mocked(api.put).mockResolvedValue(updated)

    const result = await updateActor({ id: 'a1', name: 'Alice Updated' })

    expect(api.put).toHaveBeenCalledWith('/actors/a1', { id: 'a1', name: 'Alice Updated' })
    expect(result).toEqual(updated)
  })

  it('updateActor falls back to merging local state when the actor was previously seen', async () => {
    vi.mocked(api.get).mockResolvedValue([serverActor])
    await fetchActors()
    vi.mocked(api.put).mockRejectedValue(new Error('network down'))

    const result = await updateActor({ id: 'a1', name: 'Offline Edit' })

    expect(result.name).toBe('Offline Edit')
    expect(result.email).toBe('alice@test.com')
  })

  it('updateActor throws when the actor is unknown locally and the API call fails', async () => {
    vi.mocked(api.put).mockRejectedValue(new Error('network down'))

    await expect(updateActor({ id: 'unknown-actor' })).rejects.toThrow('Actor not found')
  })

  it('deleteActor swallows API failures', async () => {
    vi.mocked(api.del).mockRejectedValue(new Error('network down'))

    await expect(deleteActor('a1')).resolves.toBeUndefined()
    expect(api.del).toHaveBeenCalledWith('/actors/a1')
  })
})
