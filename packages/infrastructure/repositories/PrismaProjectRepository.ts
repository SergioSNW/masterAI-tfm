import type { Project } from '@masterai/core'
import type { IProjectRepository } from '@masterai/core'
import { prisma } from '../database/client'

export class PrismaProjectRepository implements IProjectRepository {
  async findById(id: string): Promise<Project | null> {
    return prisma.project.findUnique({ where: { id } }) as Promise<Project | null>
  }

  async findByDirectorId(directorId: string): Promise<Project[]> {
    return prisma.project.findMany({ where: { directorId } }) as Promise<Project[]>
  }

  async create(project: Project): Promise<Project> {
    return prisma.project.create({ data: project }) as Promise<Project>
  }

  async update(project: Project): Promise<Project> {
    return prisma.project.update({ where: { id: project.id }, data: project }) as Promise<Project>
  }

  async delete(id: string): Promise<void> {
    await prisma.project.delete({ where: { id } })
  }
}
