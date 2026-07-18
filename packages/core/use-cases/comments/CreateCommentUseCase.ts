import type { Comment } from '../../entities'
import type { ICommentRepository, ISubmissionRepository } from '../../repositories'
import type { Result } from '../types'

export interface CreateCommentDTO {
  submissionId: string
  authorName: string
  content: string
}

export class CreateCommentUseCase {
  constructor(
    private readonly commentRepo: ICommentRepository,
    private readonly submissionRepo: ISubmissionRepository,
  ) {}

  async execute(dto: CreateCommentDTO): Promise<Result<Comment>> {
    if (!dto.content.trim()) {
      return { ok: false, error: new Error('Comment content cannot be empty') }
    }

    const submission = await this.submissionRepo.findById(dto.submissionId)
    if (!submission) {
      return { ok: false, error: new Error('Submission not found') }
    }

    const comment: Comment = {
      id: crypto.randomUUID(),
      submissionId: dto.submissionId,
      authorName: dto.authorName,
      content: dto.content.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const created = await this.commentRepo.create(comment)
    return { ok: true, data: created }
  }
}
