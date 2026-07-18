import type { Comment } from '../../entities'
import type { ICommentRepository, ISubmissionRepository } from '../../repositories'
import type { Result } from '../types'

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
