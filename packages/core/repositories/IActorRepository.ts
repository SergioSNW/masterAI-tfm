import type { Actor } from '../entities'

export interface IActorRepository {
  findById(id: string): Promise<Actor | null>
  findByEmail(email: string): Promise<Actor | null>
  findMany(search?: string): Promise<Actor[]>
  create(actor: Actor): Promise<Actor>
  update(actor: Actor): Promise<Actor>
  delete(id: string): Promise<void>
}
