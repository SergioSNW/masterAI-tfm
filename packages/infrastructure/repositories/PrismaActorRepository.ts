import type { Actor } from '@masterai/core'
import type { IActorRepository } from '@masterai/core'
import { prisma } from '@masterai/database'

export class PrismaActorRepository implements IActorRepository {
  async findById(id: string): Promise<Actor | null> {
    return prisma.actor.findUnique({ where: { id } }) as unknown as Promise<Actor | null>
  }

  async findByEmail(email: string): Promise<Actor | null> {
    return prisma.actor.findUnique({ where: { email } }) as unknown as Promise<Actor | null>
  }

  async findMany(search?: string): Promise<Actor[]> {
    if (search) {
      return prisma.actor.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
        orderBy: { name: 'asc' },
      }) as unknown as Promise<Actor[]>
    }
    return prisma.actor.findMany({ orderBy: { name: 'asc' } }) as unknown as Promise<Actor[]>
  }

  async create(actor: Actor): Promise<Actor> {
    return prisma.actor.create({ data: actor }) as unknown as Promise<Actor>
  }

  async update(actor: Actor): Promise<Actor> {
    return prisma.actor.update({ where: { id: actor.id }, data: actor }) as unknown as Promise<Actor>
  }

  async delete(id: string): Promise<void> {
    await prisma.actor.delete({ where: { id } })
  }
}
