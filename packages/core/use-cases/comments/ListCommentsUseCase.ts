import type { Comment } from '../../entities/index.js'
import type { ICommentRepository, ISubmissionRepository } from '../../repositories/index.js'
import type { Result } from '../types.js'

export interface ListCommentsDTO {
  submissionId: string
}

export class ListCommentsUseCase {
  constructor(
    private readonly commentRepo: ICommentRepository,
    private readonly submissionRepo: ISubmissionRepository,
  ) {}

  async execute(dto: ListCommentsDTO): Promise<Result<Comment[]>> {
    const submission = await this.submissionRepo.findById(dto.submissionId)
    if (!submission) {
      return { ok: false, error: new Error('Submission not found') }
    }

    const comments = await this.commentRepo.findBySubmissionId(dto.submissionId)
    return { ok: true, data: comments }
  }
}
