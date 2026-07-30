import type { Actor } from '../../entities'
import type { IActorRepository } from '../../repositories'
import type { Result } from '../types'

export interface CreateActorDTO {
  email: string
  name: string
  phone?: string
  profilePictureUrl?: string
  bio?: string
  agency?: string
  availability?: string
  preferredRoles?: string
  castingStage?: string
}

export class CreateActorUseCase {
  constructor(private readonly actorRepo: IActorRepository) {}

  async execute(dto: CreateActorDTO): Promise<Result<Actor>> {
    const existing = await this.actorRepo.findByEmail(dto.email)
    if (existing) {
      return { ok: false, error: new Error('An actor with this email already exists') }
    }

    const actor: Actor = {
      id: crypto.randomUUID(),
      email: dto.email,
      name: dto.name,
      phone: dto.phone,
      profilePictureUrl: dto.profilePictureUrl,
      bio: dto.bio,
      agency: dto.agency,
      availability: dto.availability ?? 'Available',
      preferredRoles: dto.preferredRoles,
      castingStage: dto.castingStage ?? 'Pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const created = await this.actorRepo.create(actor)
    return { ok: true, data: created }
  }
}
