import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCloudinarySignature, uploadVideoToCloudinary } from '../../services/cloudinaryService'

describe('cloudinaryService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('getCloudinarySignature fetches the signed payload from our own API', async () => {
    const signature = { signature: 'sig', timestamp: 123, folder: 'actor_auditions', apiKey: 'key', cloudName: 'cloud' }
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => signature } as Response)

    const result = await getCloudinarySignature()

    expect(fetch).toHaveBeenCalledWith('/api/cloudinary/sign')
    expect(result).toEqual(signature)
  })

  it('getCloudinarySignature throws the server error message when signing fails', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, json: async () => ({ error: 'OPENAI_API_KEY is not configured' }) } as Response)

    await expect(getCloudinarySignature()).rejects.toThrow('OPENAI_API_KEY is not configured')
  })

  it('uploadVideoToCloudinary posts a signed multipart form and returns the secure URL', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ secure_url: 'https://res.cloudinary.com/demo/video.mp4' }) } as Response)

    const file = new File(['data'], 'audition.mp4', { type: 'video/mp4' })
    const result = await uploadVideoToCloudinary(file, { signature: 'sig', timestamp: 123, folder: 'actor_auditions', apiKey: 'key', cloudName: 'demo' })

    expect(fetch).toHaveBeenCalledWith('https://api.cloudinary.com/v1_1/demo/video/upload', expect.objectContaining({ method: 'POST' }))
    expect(result).toBe('https://res.cloudinary.com/demo/video.mp4')
  })

  it('uploadVideoToCloudinary throws Cloudinary\'s error message on failure', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ error: { message: 'Invalid signature' } }),
    } as Response)

    const file = new File(['data'], 'audition.mp4', { type: 'video/mp4' })

    await expect(
      uploadVideoToCloudinary(file, { signature: 'bad', timestamp: 123, folder: 'actor_auditions', apiKey: 'key', cloudName: 'demo' }),
    ).rejects.toThrow('Invalid signature')
  })
})
