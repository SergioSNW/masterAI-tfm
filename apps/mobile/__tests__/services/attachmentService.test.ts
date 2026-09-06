import { get } from '../../src/services/api'
import { fetchAttachments } from '../../src/services/attachmentService'

jest.mock('../../src/services/api', () => ({
  get: jest.fn(),
}))

const mockedGet = get as jest.MockedFunction<typeof get>

const mockAttachments = [
  { id: 'a1', roundId: 'r1', fileName: 'Script_Scene_1.pdf', fileType: 'application/pdf', url: 'https://blob.vercel-storage.com/script.pdf', fileSize: 245000, createdAt: '2026-07-05T00:00:00.000Z' },
  { id: 'a2', roundId: 'r1', fileName: 'Contract_Draft.pdf', fileType: 'application/pdf', url: 'https://blob.vercel-storage.com/contract.pdf', fileSize: 180000, createdAt: '2026-07-06T00:00:00.000Z' },
]

describe('attachmentService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetchAttachments requests attachments for the given round', async () => {
    mockedGet.mockResolvedValue(mockAttachments)

    const attachments = await fetchAttachments('r1')

    expect(mockedGet).toHaveBeenCalledWith('/rounds/attachments?roundId=r1')
    expect(attachments).toEqual(mockAttachments)
  })

  it('URL-encodes the round id', async () => {
    mockedGet.mockResolvedValue([])

    await fetchAttachments('round/with special chars')

    expect(mockedGet).toHaveBeenCalledWith('/rounds/attachments?roundId=round%2Fwith%20special%20chars')
  })

  it('each attachment has the fields the UI relies on', async () => {
    mockedGet.mockResolvedValue(mockAttachments)

    const attachments = await fetchAttachments('r1')

    for (const a of attachments) {
      expect(a).toHaveProperty('id')
      expect(a).toHaveProperty('roundId')
      expect(a).toHaveProperty('fileName')
      expect(a).toHaveProperty('fileType')
      expect(a).toHaveProperty('url')
      expect(a).toHaveProperty('fileSize')
      expect(a).toHaveProperty('createdAt')
    }
  })

  it('propagates a rejection when the request fails', async () => {
    mockedGet.mockRejectedValue(new Error('network down'))

    await expect(fetchAttachments('r1')).rejects.toThrow('network down')
  })
})
