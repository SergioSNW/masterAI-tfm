import type { Project } from '../../entities'
import type { IProjectRepository } from '../../repositories'
import type { Result } from '../types'

export interface UpdateProjectStatusDTO {
  projectId: string
  status: 'draft' | 'active' | 'closed'
}

export class UpdateProjectStatusUseCase {
  constructor(private readonly projectRepo: IProjectRepository) {}

  async execute(dto: UpdateProjectStatusDTO): Promise<Result<Project>> {
    const existing = await this.projectRepo.findById(dto.projectId)
    if (!existing) {
      return { ok: false, error: new Error('Project not found') }
    }

    const updated: Project = { ...existing, status: dto.status, updatedAt: new Date() }
    const result = await this.projectRepo.update(updated)
    return { ok: true, data: result }
  }
}
