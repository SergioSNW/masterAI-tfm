import type { Casting } from '@masterai/core'
import type { ICastingRepository } from '@masterai/core'
import { prisma } from '../database/client'

export class PrismaCastingRepository implements ICastingRepository {
  async findById(id: string): Promise<Casting | null> {
    return prisma.casting.findUnique({ where: { id } }) as Promise<Casting | null>
  }

  async findByProjectId(projectId: string): Promise<Casting[]> {
    return prisma.casting.findMany({ where: { projectId } }) as Promise<Casting[]>
  }

  async create(casting: Casting): Promise<Casting> {
    return prisma.casting.create({ data: casting }) as Promise<Casting>
  }

  async update(casting: Casting): Promise<Casting> {
    return prisma.casting.update({ where: { id: casting.id }, data: casting }) as Promise<Casting>
  }

  async delete(id: string): Promise<void> {
    await prisma.casting.delete({ where: { id } })
  }
}
