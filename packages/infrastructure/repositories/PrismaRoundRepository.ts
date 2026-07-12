import type { Round } from '@masterai/core'
import type { IRoundRepository } from '@masterai/core'
import { prisma } from '../database/client'

export class PrismaRoundRepository implements IRoundRepository {
  async findById(id: string): Promise<Round | null> {
    return prisma.round.findUnique({ where: { id } }) as Promise<Round | null>
  }

  async findByCastingId(castingId: string): Promise<Round[]> {
    return prisma.round.findMany({ where: { castingId }, orderBy: { order: 'asc' } }) as Promise<Round[]>
  }

  async create(round: Round): Promise<Round> {
    return prisma.round.create({ data: round }) as Promise<Round>
  }

  async update(round: Round): Promise<Round> {
    return prisma.round.update({ where: { id: round.id }, data: round }) as Promise<Round>
  }

  async delete(id: string): Promise<void> {
    await prisma.round.delete({ where: { id } })
  }
}
