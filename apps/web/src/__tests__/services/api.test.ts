import { describe, it, expect, vi, beforeEach } from 'vitest'
import { get, post, put, del } from '../../services/api'

describe('api client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('get() issues a GET request against the /api base and returns parsed JSON', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => [{ id: 'a1' }],
    } as Response)

    const result = await get<{ id: string }[]>('/actors')

    expect(fetch).toHaveBeenCalledWith('/api/actors', expect.objectContaining({
      headers: { 'Content-Type': 'application/json' },
    }))
    expect(result).toEqual([{ id: 'a1' }])
  })

  it('post() sends a JSON-serialized body with method POST', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ id: 'c1' }) } as Response)

    await post('/castings/create', { roleName: 'Lady Victoria' })

    expect(fetch).toHaveBeenCalledWith('/api/castings/create', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ roleName: 'Lady Victoria' }),
    }))
  })

  it('put() sends method PUT', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({}) } as Response)

    await put('/actors/a1', { name: 'New Name' })

    expect(fetch).toHaveBeenCalledWith('/api/actors/a1', expect.objectContaining({ method: 'PUT' }))
  })

  it('del() sends method DELETE with no body', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({}) } as Response)

    await del('/actors/a1')

    expect(fetch).toHaveBeenCalledWith('/api/actors/a1', expect.objectContaining({ method: 'DELETE' }))
  })

  it('throws the parsed error body when the response is not ok', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      statusText: 'Bad Request',
      json: async () => ({ error: 'Validation failed' }),
    } as Response)

    await expect(get('/actors')).rejects.toEqual({ error: 'Validation failed' })
  })

  it('falls back to statusText when the error body is not valid JSON', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error',
      json: async () => { throw new Error('not json') },
    } as unknown as Response)

    await expect(get('/actors')).rejects.toEqual({ error: 'Internal Server Error' })
  })
})
