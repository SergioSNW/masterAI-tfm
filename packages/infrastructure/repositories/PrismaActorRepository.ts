import type { Actor } from '@masterai/core'
import type { IActorRepository } from '@masterai/core'
import { prisma } from '../database/client'

export class PrismaActorRepository implements IActorRepository {
  async findById(id: string): Promise<Actor | null> {
    return prisma.actor.findUnique({ where: { id } }) as Promise<Actor | null>
  }

  async findByEmail(email: string): Promise<Actor | null> {
    return prisma.actor.findUnique({ where: { email } }) as Promise<Actor | null>
  }

  async create(actor: Actor): Promise<Actor> {
    return prisma.actor.create({ data: actor }) as Promise<Actor>
  }

  async update(actor: Actor): Promise<Actor> {
    return prisma.actor.update({ where: { id: actor.id }, data: actor }) as Promise<Actor>
  }

  async delete(id: string): Promise<void> {
    await prisma.actor.delete({ where: { id } })
  }
}
