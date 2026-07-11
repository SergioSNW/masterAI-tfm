import type { Round } from '../entities'

export interface IRoundRepository {
  findById(id: string): Promise<Round | null>
  findByCastingId(castingId: string): Promise<Round[]>
  create(round: Round): Promise<Round>
  update(round: Round): Promise<Round>
  delete(id: string): Promise<void>
}
