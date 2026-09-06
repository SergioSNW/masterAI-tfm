import { describe, it, expect, vi } from 'vitest'
import { CreateSubmissionUseCase } from '../../use-cases/submissions/CreateSubmissionUseCase.js'
import type {
  ISubmissionRepository,
  IRoundRepository,
  ICastingRepository,
  IActorRepository,
} from '../../repositories/index.js'
import type { Actor, Casting, Round, Submission } from '../../entities/index.js'

function mockSubmissionRepo(overrides?: Partial<ISubmissionRepository>): ISubmissionRepository {
  return {
    findById: vi.fn(),
    findByRoundId: vi.fn().mockResolvedValue([]),
    findByActorId: vi.fn(),
    create: vi.fn(async s => s as Submission),
    update: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  }
}

function mockRoundRepo(overrides?: Partial<IRoundRepository>): IRoundRepository {
  return {
    findById: vi.fn(),
    findByCastingId: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  }
}

function mockCastingRepo(overrides?: Partial<ICastingRepository>): ICastingRepository {
  return {
    findById: vi.fn(),
    findByProjectId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  }
}

function mockActorRepo(overrides?: Partial<IActorRepository>): IActorRepository {
  return {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  }
}

const casting: Casting = {
  id: 'c1', projectId: 'p1', roleName: 'Lady Victoria', status: 'open', activePhase: 'First Round',
  createdAt: new Date(), updatedAt: new Date(),
}
const actor: Actor = {
  id: 'a1', email: 'a1@example.com', name: 'Actor One', availability: 'Available', castingStage: 'Pending',
  createdAt: new Date(), updatedAt: new Date(),
}

function makeRound(overrides?: Partial<Round>): Round {
  return {
    id: 'r1', castingId: 'c1', name: 'Self-Tape', order: 0, status: 'pending',
    createdAt: new Date(), updatedAt: new Date(), ...overrides,
  }
}

describe('CreateSubmissionUseCase', () => {
  it('rejects when the casting does not exist', async () => {
    const castingRepo = mockCastingRepo({ findById: vi.fn().mockResolvedValue(null) })
    const useCase = new CreateSubmissionUseCase(mockSubmissionRepo(), mockRoundRepo(), castingRepo, mockActorRepo())

    const result = await useCase.execute({ castingId: 'missing', actorId: 'a1', videoUrl: 'https://cdn/video.mp4' })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toBe('Casting not found')
  })

  it('rejects when the actor does not exist', async () => {
    const castingRepo = mockCastingRepo({ findById: vi.fn().mockResolvedValue(casting) })
    const actorRepo = mockActorRepo({ findById: vi.fn().mockResolvedValue(null) })
    const useCase = new CreateSubmissionUseCase(mockSubmissionRepo(), mockRoundRepo(), castingRepo, actorRepo)

    const result = await useCase.execute({ castingId: 'c1', actorId: 'missing', videoUrl: 'https://cdn/video.mp4' })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toBe('Actor not found')
  })

  it('rejects when the casting has no rounds', async () => {
    const castingRepo = mockCastingRepo({ findById: vi.fn().mockResolvedValue(casting) })
    const actorRepo = mockActorRepo({ findById: vi.fn().mockResolvedValue(actor) })
    const roundRepo = mockRoundRepo({ findByCastingId: vi.fn().mockResolvedValue([]) })
    const useCase = new CreateSubmissionUseCase(mockSubmissionRepo(), roundRepo, castingRepo, actorRepo)

    const result = await useCase.execute({ castingId: 'c1', actorId: 'a1', videoUrl: 'https://cdn/video.mp4' })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toBe('Casting has no rounds to submit to')
  })

  it('rejects a second submission from the same actor to the same casting', async () => {
    const round = makeRound({ status: 'open' })
    const castingRepo = mockCastingRepo({ findById: vi.fn().mockResolvedValue(casting) })
    const actorRepo = mockActorRepo({ findById: vi.fn().mockResolvedValue(actor) })
    const roundRepo = mockRoundRepo({ findByCastingId: vi.fn().mockResolvedValue([round]) })
    const submissionRepo = mockSubmissionRepo({
      findByRoundId: vi.fn().mockResolvedValue([{ id: 's0', actorId: 'a1', roundId: 'r1' }]),
    })
    const useCase = new CreateSubmissionUseCase(submissionRepo, roundRepo, castingRepo, actorRepo)

    const result = await useCase.execute({ castingId: 'c1', actorId: 'a1', videoUrl: 'https://cdn/video.mp4' })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toBe('Actor already submitted to this casting')
    expect(submissionRepo.create).not.toHaveBeenCalled()
  })

  it('submits to the open round when one exists, ignoring earlier pending rounds', async () => {
    const pendingRound = makeRound({ id: 'r0', order: 0, status: 'pending' })
    const openRound = makeRound({ id: 'r1', order: 1, status: 'open' })
    const castingRepo = mockCastingRepo({ findById: vi.fn().mockResolvedValue(casting) })
    const actorRepo = mockActorRepo({ findById: vi.fn().mockResolvedValue(actor) })
    const roundRepo = mockRoundRepo({ findByCastingId: vi.fn().mockResolvedValue([pendingRound, openRound]) })
    const submissionRepo = mockSubmissionRepo()
    const useCase = new CreateSubmissionUseCase(submissionRepo, roundRepo, castingRepo, actorRepo)

    const result = await useCase.execute({ castingId: 'c1', actorId: 'a1', videoUrl: 'https://cdn/video.mp4', notes: 'Take 2' })

    expect(result.ok).toBe(true)
    expect(submissionRepo.findByRoundId).toHaveBeenCalledWith('r1')
    expect(submissionRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ roundId: 'r1', actorId: 'a1', videoUrl: 'https://cdn/video.mp4', notes: 'Take 2', status: 'pending' }),
    )
  })

  it('falls back to the first round when no round is open', async () => {
    const onlyRound = makeRound({ id: 'r0', order: 0, status: 'closed' })
    const castingRepo = mockCastingRepo({ findById: vi.fn().mockResolvedValue(casting) })
    const actorRepo = mockActorRepo({ findById: vi.fn().mockResolvedValue(actor) })
    const roundRepo = mockRoundRepo({ findByCastingId: vi.fn().mockResolvedValue([onlyRound]) })
    const submissionRepo = mockSubmissionRepo()
    const useCase = new CreateSubmissionUseCase(submissionRepo, roundRepo, castingRepo, actorRepo)

    const result = await useCase.execute({ castingId: 'c1', actorId: 'a1', videoUrl: 'https://cdn/video.mp4' })

    expect(result.ok).toBe(true)
    expect(submissionRepo.create).toHaveBeenCalledWith(expect.objectContaining({ roundId: 'r0' }))
  })
})
