import type { Actor } from '../../entities/index.js'
import type { IActorRepository } from '../../repositories/index.js'
import type { Result } from '../types.js'

export class GetActorUseCase {
  constructor(private readonly actorRepo: IActorRepository) {}

  async execute(id: string): Promise<Result<Actor>> {
    const actor = await this.actorRepo.findById(id)
    if (!actor) {
      return { ok: false, error: new Error('Actor not found') }
    }
    return { ok: true, data: actor }
  }
}
