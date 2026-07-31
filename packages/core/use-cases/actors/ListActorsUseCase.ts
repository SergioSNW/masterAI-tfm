import type { Actor } from '../../entities/index.js'
import type { IActorRepository } from '../../repositories/index.js'
import type { Result } from '../types.js'

export interface ListActorsDTO {
  search?: string
}

export class ListActorsUseCase {
  constructor(private readonly actorRepo: IActorRepository) {}

  async execute(dto: ListActorsDTO): Promise<Result<Actor[]>> {
    const actors = await this.actorRepo.findMany(dto.search)
    return { ok: true, data: actors }
  }
}
