import { describe, it, expect, vi } from 'vitest'
import { ListAttachmentsUseCase } from '../../use-cases/attachments/ListAttachmentsUseCase'
import type { IAttachmentRepository, IRoundRepository } from '../../repositories'
import type { Attachment, Round } from '../../entities'

describe('ListAttachmentsUseCase', () => {
  it('lists attachments for a round', async () => {
    const attachmentRepo: IAttachmentRepository = {
      findById: vi.fn(),
      findByRoundId: vi.fn().mockResolvedValue([
        { id: 'a1', roundId: 'r1', fileName: 'script.pdf', fileType: 'application/pdf', fileData: '#', fileSize: 50000, createdAt: new Date(), updatedAt: new Date() },
      ] as Attachment[]),
      create: vi.fn(),
      delete: vi.fn(),
    }
    const roundRepo: IRoundRepository = {
      findById: vi.fn().mockResolvedValue({ id: 'r1' } as Round),
      findByCastingId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }

    const useCase = new ListAttachmentsUseCase(attachmentRepo, roundRepo)
    const result = await useCase.execute({ roundId: 'r1' })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toHaveLength(1)
      expect(result.data[0].fileName).toBe('script.pdf')
    }
  })

  it('returns empty array when no attachments', async () => {
    const attachmentRepo: IAttachmentRepository = {
      findById: vi.fn(),
      findByRoundId: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      delete: vi.fn(),
    }
    const roundRepo: IRoundRepository = {
      findById: vi.fn().mockResolvedValue({ id: 'r1' } as Round),
      findByCastingId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }

    const useCase = new ListAttachmentsUseCase(attachmentRepo, roundRepo)
    const result = await useCase.execute({ roundId: 'r1' })

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data).toHaveLength(0)
  })

  it('rejects if round not found', async () => {
    const attachmentRepo: IAttachmentRepository = {
      findById: vi.fn(),
      findByRoundId: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    }
    const roundRepo: IRoundRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByCastingId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }

    const useCase = new ListAttachmentsUseCase(attachmentRepo, roundRepo)
    const result = await useCase.execute({ roundId: 'missing' })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toContain('Round not found')
  })
})
