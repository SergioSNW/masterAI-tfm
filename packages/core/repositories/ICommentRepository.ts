import type { Comment } from '../entities/index.js'

export interface ICommentRepository {
  findById(id: string): Promise<Comment | null>
  findBySubmissionId(submissionId: string): Promise<Comment[]>
  create(comment: Comment): Promise<Comment>
  delete(id: string): Promise<void>
}
