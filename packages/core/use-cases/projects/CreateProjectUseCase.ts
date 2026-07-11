import type { Project } from '../../entities'
import type { IProjectRepository, IDirectorRepository } from '../../repositories'
import type { Result } from '../types'

export interface CreateProjectDTO {
  directorId: string
  title: string
  description?: string
}

export class CreateProjectUseCase {
  constructor(
    private readonly projectRepo: IProjectRepository,
    private readonly directorRepo: IDirectorRepository,
  ) {}

  async execute(dto: CreateProjectDTO): Promise<Result<Project>> {
    const director = await this.directorRepo.findById(dto.directorId)
    if (!director) {
      return { ok: false, error: new Error('Director not found') }
    }

    const project: Project = {
      id: crypto.randomUUID(),
      directorId: dto.directorId,
      title: dto.title,
      description: dto.description,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const created = await this.projectRepo.create(project)
    return { ok: true, data: created }
  }
}
