import type { Round } from '../../entities'
import type { IRoundRepository } from '../../repositories'
import type { Result } from '../types'

export interface CloseRoundDTO {
  roundId: string
}

export class CloseRoundUseCase {
  constructor(private readonly roundRepo: IRoundRepository) {}

  async execute(dto: CloseRoundDTO): Promise<Result<Round>> {
    const round = await this.roundRepo.findById(dto.roundId)
    if (!round) {
      return { ok: false, error: new Error('Round not found') }
    }

    if (round.status !== 'open') {
      return { ok: false, error: new Error('Only open rounds can be closed') }
    }

    const updated: Round = { ...round, status: 'closed', updatedAt: new Date() }
    const saved = await this.roundRepo.update(updated)
    return { ok: true, data: saved }
  }
}
