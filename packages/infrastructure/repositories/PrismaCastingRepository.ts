import type { Casting } from '@masterai/core'
import type { ICastingRepository } from '@masterai/core'
import { prisma } from '@masterai/database'

export class PrismaCastingRepository implements ICastingRepository {
  async findById(id: string): Promise<Casting | null> {
    return prisma.casting.findUnique({ where: { id } }) as unknown as Promise<Casting | null>
  }

  async findByProjectId(projectId: string): Promise<Casting[]> {
    return prisma.casting.findMany({ where: { projectId } }) as unknown as Promise<Casting[]>
  }

  async create(casting: Casting): Promise<Casting> {
    return prisma.casting.create({ data: casting }) as unknown as Promise<Casting>
  }

  async update(casting: Casting): Promise<Casting> {
    return prisma.casting.update({ where: { id: casting.id }, data: casting }) as unknown as Promise<Casting>
  }

  async delete(id: string): Promise<void> {
    await prisma.casting.delete({ where: { id } })
  }
}
