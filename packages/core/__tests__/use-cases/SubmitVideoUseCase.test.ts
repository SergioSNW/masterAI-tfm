import { describe, it, expect, vi } from 'vitest'
import { SubmitVideoUseCase } from '../../use-cases/submissions/SubmitVideoUseCase'
import type { IRoundRepository, IActorRepository, ISubmissionRepository } from '../../repositories'
import type { Round, Actor, Submission } from '../../entities'

function mockRepos(overrides?: {
  round?: Partial<IRoundRepository>
  actor?: Partial<IActorRepository>
  submission?: Partial<ISubmissionRepository>
}) {
  return {
    roundRepo: {
      findById: vi.fn(),
      findByCastingId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      ...overrides?.round,
    } as IRoundRepository,
    actorRepo: {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      ...overrides?.actor,
    } as IActorRepository,
    submissionRepo: {
      findById: vi.fn(),
      findByRoundId: vi.fn(),
      findByActorId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      ...overrides?.submission,
    } as ISubmissionRepository,
  }
}

function openRound(): Round {
  return { id: 'r1', castingId: 'c1', name: 'Self-Tape', order: 0, status: 'open', createdAt: new Date(), updatedAt: new Date() }
}

function actor(): Actor {
  return { id: 'a1', email: 'actor@test.com', name: 'Test Actor', createdAt: new Date(), updatedAt: new Date() }
}

describe('SubmitVideoUseCase', () => {
  it('submits a video successfully', async () => {
    const repos = mockRepos({
      round: { findById: vi.fn().mockResolvedValue(openRound()) },
      actor: { findById: vi.fn().mockResolvedValue(actor()) },
      submission: {
        findByRoundId: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockImplementation(async (s: Submission) => s),
      },
    })

    const useCase = new SubmitVideoUseCase(repos.submissionRepo, repos.roundRepo, repos.actorRepo)
    const result = await useCase.execute({
      roundId: 'r1',
      actorId: 'a1',
      videoUrl: 'https://storage.com/video.mp4',
      notes: 'Great take',
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.roundId).toBe('r1')
      expect(result.data.actorId).toBe('a1')
      expect(result.data.notes).toBe('Great take')
    }
  })

  it('rejects submission if round is not open', async () => {
    const repos = mockRepos({
      round: { findById: vi.fn().mockResolvedValue({ ...openRound(), status: 'closed' }) },
      actor: { findById: vi.fn().mockResolvedValue(actor()) },
      submission: { findByRoundId: vi.fn().mockResolvedValue([]) },
    })

    const useCase = new SubmitVideoUseCase(repos.submissionRepo, repos.roundRepo, repos.actorRepo)
    const result = await useCase.execute({ roundId: 'r1', actorId: 'a1', videoUrl: 'https://storage.com/video.mp4' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toContain('not open')
  })

  it('rejects submission if deadline passed', async () => {
    const repos = mockRepos({
      round: { findById: vi.fn().mockResolvedValue({ ...openRound(), deadline: new Date('2020-01-01') }) },
      actor: { findById: vi.fn().mockResolvedValue(actor()) },
      submission: { findByRoundId: vi.fn().mockResolvedValue([]) },
    })

    const useCase = new SubmitVideoUseCase(repos.submissionRepo, repos.roundRepo, repos.actorRepo)
    const result = await useCase.execute({ roundId: 'r1', actorId: 'a1', videoUrl: 'https://storage.com/video.mp4' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toContain('deadline')
  })

  it('rejects duplicate actor submission per round', async () => {
    const repos = mockRepos({
      round: { findById: vi.fn().mockResolvedValue(openRound()) },
      actor: { findById: vi.fn().mockResolvedValue(actor()) },
      submission: {
        findByRoundId: vi.fn().mockResolvedValue([{ id: 's1', roundId: 'r1', actorId: 'a1' } as Submission]),
      },
    })

    const useCase = new SubmitVideoUseCase(repos.submissionRepo, repos.roundRepo, repos.actorRepo)
    const result = await useCase.execute({ roundId: 'r1', actorId: 'a1', videoUrl: 'https://storage.com/video.mp4' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toContain('already submitted')
  })

  it('rejects if round not found', async () => {
    const repos = mockRepos({
      round: { findById: vi.fn().mockResolvedValue(null) },
    })

    const useCase = new SubmitVideoUseCase(repos.submissionRepo, repos.roundRepo, repos.actorRepo)
    const result = await useCase.execute({ roundId: 'r1', actorId: 'a1', videoUrl: 'https://storage.com/video.mp4' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toContain('Round not found')
  })

  it('rejects if actor not found', async () => {
    const repos = mockRepos({
      round: { findById: vi.fn().mockResolvedValue(openRound()) },
      actor: { findById: vi.fn().mockResolvedValue(null) },
    })

    const useCase = new SubmitVideoUseCase(repos.submissionRepo, repos.roundRepo, repos.actorRepo)
    const result = await useCase.execute({ roundId: 'r1', actorId: 'a1', videoUrl: 'https://storage.com/video.mp4' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toContain('Actor not found')
  })
})
