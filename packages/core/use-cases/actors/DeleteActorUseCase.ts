import type { IActorRepository } from '../../repositories/index.js'
import type { Result } from '../types.js'

export class DeleteActorUseCase {
  constructor(private readonly actorRepo: IActorRepository) {}

  async execute(id: string): Promise<Result<void>> {
    const existing = await this.actorRepo.findById(id)
    if (!existing) {
      return { ok: false, error: new Error('Actor not found') }
    }

    await this.actorRepo.delete(id)
    return { ok: true, data: undefined }
  }
}
