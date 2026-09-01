import { describe, it, expect, vi } from 'vitest'
import { RemoveAttachmentUseCase } from '../../use-cases/attachments/RemoveAttachmentUseCase.js'
import type { IAttachmentRepository } from '../../repositories/index.js'

function mockRepo(overrides?: Partial<IAttachmentRepository>): IAttachmentRepository {
  return {
    findById: vi.fn(),
    findByRoundId: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  }
}

describe('RemoveAttachmentUseCase', () => {
  it('deletes an existing attachment', async () => {
    const repo = mockRepo({
      findById: vi.fn().mockResolvedValue({ id: 'att1' }),
      delete: vi.fn().mockResolvedValue(undefined),
    })

    const useCase = new RemoveAttachmentUseCase(repo)
    const result = await useCase.execute('att1')

    expect(result.ok).toBe(true)
    expect(repo.delete).toHaveBeenCalledWith('att1')
  })

  it('rejects delete for non-existent attachment', async () => {
    const repo = mockRepo({
      findById: vi.fn().mockResolvedValue(null),
    })

    const useCase = new RemoveAttachmentUseCase(repo)
    const result = await useCase.execute('missing')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.message).toContain('not found')
    }
    expect(repo.delete).not.toHaveBeenCalled()
  })
})
