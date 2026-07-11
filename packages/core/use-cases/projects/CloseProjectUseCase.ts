import type { Project } from '../../entities'
import type { IProjectRepository } from '../../repositories'
import type { Result } from '../types'

export interface CloseProjectDTO {
  projectId: string
  directorId: string
}

export class CloseProjectUseCase {
  constructor(private readonly projectRepo: IProjectRepository) {}

  async execute(dto: CloseProjectDTO): Promise<Result<Project>> {
    const project = await this.projectRepo.findById(dto.projectId)
    if (!project) {
      return { ok: false, error: new Error('Project not found') }
    }

    if (project.directorId !== dto.directorId) {
      return { ok: false, error: new Error('Not authorized to close this project') }
    }

    if (project.status === 'closed') {
      return { ok: false, error: new Error('Project is already closed') }
    }

    const updated: Project = { ...project, status: 'closed', updatedAt: new Date() }
    const saved = await this.projectRepo.update(updated)
    return { ok: true, data: saved }
  }
}
