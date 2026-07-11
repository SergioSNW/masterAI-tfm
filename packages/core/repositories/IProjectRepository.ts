import type { Project } from '../entities'

export interface IProjectRepository {
  findById(id: string): Promise<Project | null>
  findByDirectorId(directorId: string): Promise<Project[]>
  create(project: Project): Promise<Project>
  update(project: Project): Promise<Project>
  delete(id: string): Promise<void>
}
