import { describe, it, expect, vi } from 'vitest'
import { CreateCommentUseCase } from '../../use-cases/comments/CreateCommentUseCase'
import type { ICommentRepository, ISubmissionRepository } from '../../repositories'
import type { Comment, Submission } from '../../entities'

function mockRepos() {
  return {
    commentRepo: {
      findById: vi.fn(),
      findBySubmissionId: vi.fn(),
      create: vi.fn().mockImplementation(async (c: Comment) => c),
      delete: vi.fn(),
    } as ICommentRepository,
    submissionRepo: {
      findById: vi.fn(),
      findByRoundId: vi.fn(),
      findByActorId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as ISubmissionRepository,
  }
}

describe('CreateCommentUseCase', () => {
  it('creates a comment successfully', async () => {
    const repos = mockRepos()
    repos.submissionRepo.findById = vi.fn().mockResolvedValue({
      id: 's1', roundId: 'r1', actorId: 'a1', videoUrl: '#', status: 'pending',
      createdAt: new Date(), updatedAt: new Date(),
    } as Submission)

    const useCase = new CreateCommentUseCase(repos.commentRepo, repos.submissionRepo)
    const result = await useCase.execute({
      submissionId: 's1',
      authorName: 'Director',
      content: 'Great energy in this take!',
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.submissionId).toBe('s1')
      expect(result.data.authorName).toBe('Director')
      expect(result.data.content).toBe('Great energy in this take!')
    }
  })

  it('rejects if content is empty', async () => {
    const repos = mockRepos()
    const useCase = new CreateCommentUseCase(repos.commentRepo, repos.submissionRepo)
    const result = await useCase.execute({
      submissionId: 's1',
      authorName: 'Director',
      content: '   ',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toContain('cannot be empty')
  })

  it('rejects if submission not found', async () => {
    const repos = mockRepos()
    repos.submissionRepo.findById = vi.fn().mockResolvedValue(null)

    const useCase = new CreateCommentUseCase(repos.commentRepo, repos.submissionRepo)
    const result = await useCase.execute({
      submissionId: 'missing',
      authorName: 'Director',
      content: 'Nice work',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toContain('Submission not found')
  })
})
