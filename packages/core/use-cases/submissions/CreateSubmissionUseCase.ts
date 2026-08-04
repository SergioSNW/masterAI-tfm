import type { Submission } from '../../entities/index.js'
import type { ISubmissionRepository, IRoundRepository, ICastingRepository, IActorRepository } from '../../repositories/index.js'
import type { Result } from '../types.js'

export interface CreateSubmissionDTO {
  castingId: string
  actorId: string
  videoUrl: string
  notes?: string
}

export class CreateSubmissionUseCase {
  constructor(
    private readonly submissionRepo: ISubmissionRepository,
    private readonly roundRepo: IRoundRepository,
    private readonly castingRepo: ICastingRepository,
    private readonly actorRepo: IActorRepository,
  ) {}

  async execute(dto: CreateSubmissionDTO): Promise<Result<Submission>> {
    const casting = await this.castingRepo.findById(dto.castingId)
    if (!casting) {
      return { ok: false, error: new Error('Casting not found') }
    }

    const actor = await this.actorRepo.findById(dto.actorId)
    if (!actor) {
      return { ok: false, error: new Error('Actor not found') }
    }

    const rounds = await this.roundRepo.findByCastingId(dto.castingId)
    const round = rounds.find(r => r.status === 'open') ?? rounds[0]
    if (!round) {
      return { ok: false, error: new Error('Casting has no rounds to submit to') }
    }

    const existing = await this.submissionRepo.findByRoundId(round.id)
    if (existing.find(s => s.actorId === dto.actorId)) {
      return { ok: false, error: new Error('Actor already submitted to this casting') }
    }

    const submission: Submission = {
      id: crypto.randomUUID(),
      roundId: round.id,
      actorId: dto.actorId,
      videoUrl: dto.videoUrl,
      notes: dto.notes,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const created = await this.submissionRepo.create(submission)
    return { ok: true, data: created }
  }
}
