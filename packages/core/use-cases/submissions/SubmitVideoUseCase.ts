import type { Submission } from '../../entities'
import type { ISubmissionRepository, IRoundRepository, IActorRepository } from '../../repositories'
import type { Result } from '../types'

export interface SubmitVideoDTO {
  roundId: string
  actorId: string
  videoUrl: string
  thumbnailUrl?: string
  notes?: string
}

export class SubmitVideoUseCase {
  constructor(
    private readonly submissionRepo: ISubmissionRepository,
    private readonly roundRepo: IRoundRepository,
    private readonly actorRepo: IActorRepository,
  ) {}

  async execute(dto: SubmitVideoDTO): Promise<Result<Submission>> {
    const round = await this.roundRepo.findById(dto.roundId)
    if (!round) {
      return { ok: false, error: new Error('Round not found') }
    }

    if (round.status !== 'open') {
      return { ok: false, error: new Error('Round is not open for submissions') }
    }

    if (round.deadline && new Date() > round.deadline) {
      return { ok: false, error: new Error('Submission deadline has passed') }
    }

    const actor = await this.actorRepo.findById(dto.actorId)
    if (!actor) {
      return { ok: false, error: new Error('Actor not found') }
    }

    const existing = await this.submissionRepo.findByRoundId(dto.roundId)
    const alreadySubmitted = existing.find(s => s.actorId === dto.actorId)
    if (alreadySubmitted) {
      return { ok: false, error: new Error('Actor already submitted to this round') }
    }

    const submission: Submission = {
      id: crypto.randomUUID(),
      roundId: dto.roundId,
      actorId: dto.actorId,
      videoUrl: dto.videoUrl,
      thumbnailUrl: dto.thumbnailUrl,
      notes: dto.notes,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const created = await this.submissionRepo.create(submission)
    return { ok: true, data: created }
  }
}
