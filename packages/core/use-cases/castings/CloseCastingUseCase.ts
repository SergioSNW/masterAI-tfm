import type { Casting } from '../../entities'
import type { ICastingRepository } from '../../repositories'
import type { Result } from '../types'

export interface CloseCastingDTO {
  castingId: string
}

export class CloseCastingUseCase {
  constructor(private readonly castingRepo: ICastingRepository) {}

  async execute(dto: CloseCastingDTO): Promise<Result<Casting>> {
    const casting = await this.castingRepo.findById(dto.castingId)
    if (!casting) {
      return { ok: false, error: new Error('Casting not found') }
    }

    if (casting.status === 'closed') {
      return { ok: false, error: new Error('Casting is already closed') }
    }

    const updated: Casting = { ...casting, status: 'closed', updatedAt: new Date() }
    const saved = await this.castingRepo.update(updated)
    return { ok: true, data: saved }
  }
}
