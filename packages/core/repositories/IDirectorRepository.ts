import type { Director } from '../entities'

export interface IDirectorRepository {
  findById(id: string): Promise<Director | null>
  findByEmail(email: string): Promise<Director | null>
  create(director: Director): Promise<Director>
  update(director: Director): Promise<Director>
  delete(id: string): Promise<void>
}
