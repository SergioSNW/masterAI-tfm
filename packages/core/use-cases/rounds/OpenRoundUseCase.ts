import type { Round } from '../../entities'
import type { IRoundRepository } from '../../repositories'
import type { Result } from '../types'

export interface OpenRoundDTO {
  roundId: string
}

export class OpenRoundUseCase {
  constructor(private readonly roundRepo: IRoundRepository) {}

  async execute(dto: OpenRoundDTO): Promise<Result<Round>> {
    const round = await this.roundRepo.findById(dto.roundId)
    if (!round) {
      return { ok: false, error: new Error('Round not found') }
    }

    if (round.status !== 'pending') {
      return { ok: false, error: new Error('Only pending rounds can be opened') }
    }

    const updated: Round = { ...round, status: 'open', updatedAt: new Date() }
    const saved = await this.roundRepo.update(updated)
    return { ok: true, data: saved }
  }
}
