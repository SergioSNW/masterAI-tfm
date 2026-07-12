import type { Director } from '@masterai/core'
import type { IDirectorRepository } from '@masterai/core'
import { prisma } from '../database/client'

export class PrismaDirectorRepository implements IDirectorRepository {
  async findById(id: string): Promise<Director | null> {
    return prisma.director.findUnique({ where: { id } }) as Promise<Director | null>
  }

  async findByEmail(email: string): Promise<Director | null> {
    return prisma.director.findUnique({ where: { email } }) as Promise<Director | null>
  }

  async create(director: Director): Promise<Director> {
    return prisma.director.create({ data: director }) as Promise<Director>
  }

  async update(director: Director): Promise<Director> {
    return prisma.director.update({ where: { id: director.id }, data: director }) as Promise<Director>
  }

  async delete(id: string): Promise<void> {
    await prisma.director.delete({ where: { id } })
  }
}
