import { describe, it, expect, vi } from 'vitest'
import { ListCommentsUseCase } from '../../use-cases/comments/ListCommentsUseCase'
import type { ICommentRepository, ISubmissionRepository } from '../../repositories'
import type { Comment, Submission } from '../../entities'

describe('ListCommentsUseCase', () => {
  it('lists comments for a submission', async () => {
    const commentRepo: ICommentRepository = {
      findById: vi.fn(),
      findBySubmissionId: vi.fn().mockResolvedValue([
        { id: 'c1', submissionId: 's1', authorName: 'Director', content: 'Nice work', createdAt: new Date(), updatedAt: new Date() },
      ] as Comment[]),
      create: vi.fn(),
      delete: vi.fn(),
    }
    const submissionRepo: ISubmissionRepository = {
      findById: vi.fn().mockResolvedValue({ id: 's1' } as Submission),
      findByRoundId: vi.fn(),
      findByActorId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }

    const useCase = new ListCommentsUseCase(commentRepo, submissionRepo)
    const result = await useCase.execute({ submissionId: 's1' })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toHaveLength(1)
      expect(result.data[0].content).toBe('Nice work')
    }
  })

  it('returns empty array when no comments', async () => {
    const commentRepo: ICommentRepository = {
      findById: vi.fn(),
      findBySubmissionId: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      delete: vi.fn(),
    }
    const submissionRepo: ISubmissionRepository = {
      findById: vi.fn().mockResolvedValue({ id: 's1' } as Submission),
      findByRoundId: vi.fn(),
      findByActorId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }

    const useCase = new ListCommentsUseCase(commentRepo, submissionRepo)
    const result = await useCase.execute({ submissionId: 's1' })

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data).toHaveLength(0)
  })

  it('rejects if submission not found', async () => {
    const commentRepo: ICommentRepository = {
      findById: vi.fn(),
      findBySubmissionId: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    }
    const submissionRepo: ISubmissionRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByRoundId: vi.fn(),
      findByActorId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }

    const useCase = new ListCommentsUseCase(commentRepo, submissionRepo)
    const result = await useCase.execute({ submissionId: 'missing' })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toContain('Submission not found')
  })
})
