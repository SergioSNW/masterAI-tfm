import type { Submission } from '../entities'

export interface ISubmissionRepository {
  findById(id: string): Promise<Submission | null>
  findByRoundId(roundId: string): Promise<Submission[]>
  findByActorId(actorId: string): Promise<Submission[]>
  create(submission: Submission): Promise<Submission>
  update(submission: Submission): Promise<Submission>
  delete(id: string): Promise<void>
}
