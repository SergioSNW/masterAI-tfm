import { describe, it, expect, vi } from 'vitest'
import { AddAttachmentUseCase } from '../../use-cases/attachments/AddAttachmentUseCase'
import type { IAttachmentRepository, IRoundRepository } from '../../repositories'
import type { Attachment, Round } from '../../entities'

function mockRepos() {
  return {
    attachmentRepo: {
      findById: vi.fn(),
      findByRoundId: vi.fn(),
      create: vi.fn().mockImplementation(async (a: Attachment) => a),
      delete: vi.fn(),
    } as IAttachmentRepository,
    roundRepo: {
      findById: vi.fn(),
      findByCastingId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as IRoundRepository,
  }
}

describe('AddAttachmentUseCase', () => {
  it('adds an attachment successfully', async () => {
    const repos = mockRepos()
    repos.roundRepo.findById = vi.fn().mockResolvedValue({ id: 'r1', castingId: 'c1', name: 'Self-Tape', order: 0, status: 'open', createdAt: new Date(), updatedAt: new Date() } as Round)

    const useCase = new AddAttachmentUseCase(repos.attachmentRepo, repos.roundRepo)
    const result = await useCase.execute({ roundId: 'r1', fileName: 'script.pdf', fileType: 'application/pdf', fileData: 'base64data', fileSize: 50000 })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.fileName).toBe('script.pdf')
      expect(result.data.fileSize).toBe(50000)
    }
  })

  it('rejects if round not found', async () => {
    const repos = mockRepos()
    repos.roundRepo.findById = vi.fn().mockResolvedValue(null)

    const useCase = new AddAttachmentUseCase(repos.attachmentRepo, repos.roundRepo)
    const result = await useCase.execute({ roundId: 'missing', fileName: 'script.pdf', fileType: 'application/pdf', fileData: 'data', fileSize: 1000 })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toContain('Round not found')
  })

  it('rejects empty file name', async () => {
    const repos = mockRepos()
    repos.roundRepo.findById = vi.fn().mockResolvedValue({ id: 'r1' } as Round)

    const useCase = new AddAttachmentUseCase(repos.attachmentRepo, repos.roundRepo)
    const result = await useCase.execute({ roundId: 'r1', fileName: '   ', fileType: 'application/pdf', fileData: 'data', fileSize: 1000 })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toContain('File name is required')
  })

  it('rejects file exceeding 10MB limit', async () => {
    const repos = mockRepos()
    repos.roundRepo.findById = vi.fn().mockResolvedValue({ id: 'r1' } as Round)

    const useCase = new AddAttachmentUseCase(repos.attachmentRepo, repos.roundRepo)
    const result = await useCase.execute({ roundId: 'r1', fileName: 'script.pdf', fileType: 'application/pdf', fileData: 'data', fileSize: 15 * 1024 * 1024 })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toContain('10MB limit')
  })
})
