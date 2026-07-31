import type { Project } from '../../entities/index.js'
import type { IProjectRepository } from '../../repositories/index.js'
import type { Result } from '../types.js'

export class ListProjectsUseCase {
  constructor(private readonly projectRepo: IProjectRepository) {}

  async execute(): Promise<Result<Project[]>> {
    const projects = await this.projectRepo.findAll()
    return { ok: true, data: projects }
  }
}
