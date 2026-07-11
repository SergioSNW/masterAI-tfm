import type { Round } from '../../entities'
import type { IRoundRepository, ICastingRepository } from '../../repositories'
import type { Result } from '../types'

export interface CreateRoundDTO {
  castingId: string
  name: string
  description?: string
  deadline?: Date
  order: number
}

export class CreateRoundUseCase {
  constructor(
    private readonly roundRepo: IRoundRepository,
    private readonly castingRepo: ICastingRepository,
  ) {}

  async execute(dto: CreateRoundDTO): Promise<Result<Round>> {
    const casting = await this.castingRepo.findById(dto.castingId)
    if (!casting) {
      return { ok: false, error: new Error('Casting not found') }
    }

    if (casting.status !== 'open') {
      return { ok: false, error: new Error('Casting must be open to create rounds') }
    }

    const round: Round = {
      id: crypto.randomUUID(),
      castingId: dto.castingId,
      name: dto.name,
      description: dto.description,
      deadline: dto.deadline,
      order: dto.order,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const created = await this.roundRepo.create(round)
    return { ok: true, data: created }
  }
}
