import type { Casting } from '../../entities'
import type { ICastingRepository } from '../../repositories'
import type { Result } from '../types'

export interface UpdateCastingPhaseDTO {
  castingId: string
  activePhase: string
}

export class UpdateCastingPhaseUseCase {
  constructor(private readonly castingRepo: ICastingRepository) {}

  async execute(dto: UpdateCastingPhaseDTO): Promise<Result<Casting>> {
    const existing = await this.castingRepo.findById(dto.castingId)
    if (!existing) {
      return { ok: false, error: new Error('Casting not found') }
    }

    const updated: Casting = { ...existing, activePhase: dto.activePhase, updatedAt: new Date() }
    const result = await this.castingRepo.update(updated)
    return { ok: true, data: result }
  }
}
