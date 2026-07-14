import { describe, it, expect, vi } from 'vitest'
import { ReviewSubmissionUseCase } from '../../use-cases/submissions/ReviewSubmissionUseCase'
import type { ISubmissionRepository } from '../../repositories'
import type { Submission } from '../../entities'

describe('ReviewSubmissionUseCase', () => {
  it('reviews a pending submission as shortlisted', async () => {
    const repo: ISubmissionRepository = {
      findById: vi.fn(),
      findByRoundId: vi.fn(),
      findByActorId: vi.fn(),
      create: vi.fn(),
      update: vi.fn().mockImplementation(async (s: Submission) => s),
      delete: vi.fn(),
    }
    repo.findById = vi.fn().mockResolvedValue({
      id: 's1', roundId: 'r1', actorId: 'a1', videoUrl: '#', status: 'pending',
      createdAt: new Date(), updatedAt: new Date(),
    } as Submission)

    const useCase = new ReviewSubmissionUseCase(repo)
    const result = await useCase.execute({ submissionId: 's1', status: 'shortlisted', feedback: 'Great work' })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.status).toBe('shortlisted')
      expect(result.data.feedback).toBe('Great work')
    }
  })

  it('rejects if submission is not pending', async () => {
    const repo: ISubmissionRepository = {
      findById: vi.fn().mockResolvedValue({
        id: 's1', roundId: 'r1', actorId: 'a1', videoUrl: '#', status: 'reviewed',
        createdAt: new Date(), updatedAt: new Date(),
      } as Submission),
      findByRoundId: vi.fn(),
      findByActorId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }

    const useCase = new ReviewSubmissionUseCase(repo)
    const result = await useCase.execute({ submissionId: 's1', status: 'rejected' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toContain('pending')
  })
})
