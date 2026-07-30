import type { Actor } from '../../entities'
import type { IActorRepository } from '../../repositories'
import type { Result } from '../types'

export interface UpdateActorDTO {
  id: string
  email?: string
  name?: string
  phone?: string | null
  profilePictureUrl?: string | null
  bio?: string | null
  agency?: string | null
  availability?: string
  preferredRoles?: string | null
  castingStage?: string
}

export class UpdateActorUseCase {
  constructor(private readonly actorRepo: IActorRepository) {}

  async execute(dto: UpdateActorDTO): Promise<Result<Actor>> {
    const existing = await this.actorRepo.findById(dto.id)
    if (!existing) {
      return { ok: false, error: new Error('Actor not found') }
    }

    if (dto.email && dto.email !== existing.email) {
      const duplicate = await this.actorRepo.findByEmail(dto.email)
      if (duplicate) {
        return { ok: false, error: new Error('An actor with this email already exists') }
      }
    }

    const updated: Actor = {
      ...existing,
      ...(dto.email !== undefined && { email: dto.email }),
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.phone !== undefined && { phone: dto.phone ?? undefined }),
      ...(dto.profilePictureUrl !== undefined && { profilePictureUrl: dto.profilePictureUrl ?? undefined }),
      ...(dto.bio !== undefined && { bio: dto.bio ?? undefined }),
      ...(dto.agency !== undefined && { agency: dto.agency ?? undefined }),
      ...(dto.availability !== undefined && { availability: dto.availability }),
      ...(dto.preferredRoles !== undefined && { preferredRoles: dto.preferredRoles ?? undefined }),
      ...(dto.castingStage !== undefined && { castingStage: dto.castingStage }),
      updatedAt: new Date(),
    }

    const result = await this.actorRepo.update(updated)
    return { ok: true, data: result }
  }
}
