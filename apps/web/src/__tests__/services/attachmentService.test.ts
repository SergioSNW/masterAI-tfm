import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as api from '../../services/api'
import { fetchAttachments, addAttachment, removeAttachment } from '../../services/attachmentService'
import type { AttachmentDTO } from '../../services/attachmentService'

vi.mock('../../services/api', () => ({
  get: vi.fn(),
  post: vi.fn(),
  del: vi.fn(),
}))

const serverAttachment: AttachmentDTO = {
  id: 'att1', roundId: 'r1', fileName: 'sides.pdf', fileType: 'application/pdf', url: 'https://blob/sides.pdf',
  fileSize: 1024, createdAt: '2026-09-01T00:00:00.000Z',
}

describe('attachmentService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchAttachments returns server data scoped to the round', async () => {
    vi.mocked(api.get).mockResolvedValue([serverAttachment])

    const result = await fetchAttachments('r1')

    expect(api.get).toHaveBeenCalledWith('/rounds/attachments?roundId=r1')
    expect(result).toEqual([serverAttachment])
  })

  it('fetchAttachments falls back to the local cache scoped to the round when the API fails', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([serverAttachment])
    await fetchAttachments('r1')

    vi.mocked(api.get).mockRejectedValueOnce(new Error('network down'))
    const result = await fetchAttachments('r1')

    expect(result).toEqual([serverAttachment])
  })

  it('fetchAttachments never leaks another round\'s cached attachments', async () => {
    vi.mocked(api.get).mockResolvedValueOnce([serverAttachment])
    await fetchAttachments('r1')

    vi.mocked(api.get).mockRejectedValueOnce(new Error('network down'))
    const result = await fetchAttachments('other-round')

    expect(result).toEqual([])
  })

  it('addAttachment returns the server-created attachment on success', async () => {
    vi.mocked(api.post).mockResolvedValue(serverAttachment)

    const result = await addAttachment({ roundId: 'r1', fileName: 'sides.pdf', fileType: 'application/pdf', url: 'https://blob/sides.pdf', fileSize: 1024 })

    expect(result).toEqual(serverAttachment)
  })

  it('addAttachment falls back to a local optimistic attachment when the API call fails', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('network down'))

    const result = await addAttachment({ roundId: 'r1', fileName: 'notes.txt', fileType: 'text/plain', url: 'https://blob/notes.txt', fileSize: 42 })

    expect(result.id).toMatch(/^local-/)
    expect(result.fileName).toBe('notes.txt')
  })

  it('removeAttachment swallows API failures', async () => {
    vi.mocked(api.del).mockRejectedValue(new Error('network down'))

    await expect(removeAttachment('att1')).resolves.toBeUndefined()
    expect(api.del).toHaveBeenCalledWith('/rounds/attachment/att1')
  })
})
