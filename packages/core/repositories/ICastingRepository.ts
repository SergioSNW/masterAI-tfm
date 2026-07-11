import type { Casting } from '../entities'

export interface ICastingRepository {
  findById(id: string): Promise<Casting | null>
  findByProjectId(projectId: string): Promise<Casting[]>
  create(casting: Casting): Promise<Casting>
  update(casting: Casting): Promise<Casting>
  delete(id: string): Promise<void>
}
