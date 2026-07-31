import type { Casting } from '../../entities/index.js'
import type { ICastingRepository } from '../../repositories/index.js'
import type { Result } from '../types.js'

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
