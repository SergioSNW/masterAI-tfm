import { describe, it, expect, vi } from 'vitest'
import { ManualUploadUseCase } from '../../use-cases/submissions/ManualUploadUseCase'
import type { ISubmissionRepository, IRoundRepository, IActorRepository } from '../../repositories'
import type { Round, Actor, Submission } from '../../entities'

function mockRepos() {
  return {
    submissionRepo: {
      findById: vi.fn(),
      findByRoundId: vi.fn(),
      findByActorId: vi.fn(),
      create: vi.fn().mockImplementation(async (s: Submission) => s),
      update: vi.fn(),
      delete: vi.fn(),
    } as ISubmissionRepository,
    roundRepo: {
      findById: vi.fn(),
      findByCastingId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as IRoundRepository,
    actorRepo: {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as IActorRepository,
  }
}

function openRound(): Round {
  return { id: 'r1', castingId: 'c1', name: 'Self-Tape', order: 0, status: 'open', createdAt: new Date(), updatedAt: new Date() }
}

function actor(): Actor {
  return { id: 'a1', email: 'actor@test.com', name: 'Test Actor', createdAt: new Date(), updatedAt: new Date() }
}

const validBase64 = 'a'.repeat(1000)

describe('ManualUploadUseCase', () => {
  it('uploads a video successfully', async () => {
    const repos = mockRepos()
    repos.roundRepo.findById = vi.fn().mockResolvedValue(openRound())
    repos.actorRepo.findById = vi.fn().mockResolvedValue(actor())
    repos.submissionRepo.findByRoundId = vi.fn().mockResolvedValue([])

    const useCase = new ManualUploadUseCase(repos.submissionRepo, repos.roundRepo, repos.actorRepo)
    const result = await useCase.execute({ roundId: 'r1', actorId: 'a1', videoData: validBase64, fileName: 'video.mp4', notes: 'Good take' })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.notes).toBe('Good take')
      expect(result.data.status).toBe('pending')
    }
  })

  it('rejects unsupported file extension', async () => {
    const repos = mockRepos()
    const useCase = new ManualUploadUseCase(repos.submissionRepo, repos.roundRepo, repos.actorRepo)
    const result = await useCase.execute({ roundId: 'r1', actorId: 'a1', videoData: validBase64, fileName: 'video.avi' })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toContain('Unsupported file type')
  })

  it('rejects file exceeding 5MB limit', async () => {
    const repos = mockRepos()
    const useCase = new ManualUploadUseCase(repos.submissionRepo, repos.roundRepo, repos.actorRepo)
    const result = await useCase.execute({ roundId: 'r1', actorId: 'a1', videoData: 'a'.repeat(7 * 1024 * 1024), fileName: 'video.mp4' })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toContain('5MB limit')
  })

  it('rejects if round not found', async () => {
    const repos = mockRepos()
    repos.roundRepo.findById = vi.fn().mockResolvedValue(null)

    const useCase = new ManualUploadUseCase(repos.submissionRepo, repos.roundRepo, repos.actorRepo)
    const result = await useCase.execute({ roundId: 'missing', actorId: 'a1', videoData: validBase64, fileName: 'video.mp4' })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toContain('Round not found')
  })

  it('rejects if round is not open', async () => {
    const repos = mockRepos()
    repos.roundRepo.findById = vi.fn().mockResolvedValue({ ...openRound(), status: 'closed' })

    const useCase = new ManualUploadUseCase(repos.submissionRepo, repos.roundRepo, repos.actorRepo)
    const result = await useCase.execute({ roundId: 'r1', actorId: 'a1', videoData: validBase64, fileName: 'video.mp4' })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toContain('not open')
  })

  it('rejects duplicate actor submission', async () => {
    const repos = mockRepos()
    repos.roundRepo.findById = vi.fn().mockResolvedValue(openRound())
    repos.actorRepo.findById = vi.fn().mockResolvedValue(actor())
    repos.submissionRepo.findByRoundId = vi.fn().mockResolvedValue([{ id: 's1', roundId: 'r1', actorId: 'a1', videoUrl: '#', status: 'pending' } as Submission])

    const useCase = new ManualUploadUseCase(repos.submissionRepo, repos.roundRepo, repos.actorRepo)
    const result = await useCase.execute({ roundId: 'r1', actorId: 'a1', videoData: validBase64, fileName: 'video.mp4' })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toContain('already submitted')
  })
})
