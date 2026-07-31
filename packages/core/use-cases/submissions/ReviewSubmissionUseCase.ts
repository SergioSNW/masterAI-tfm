import type { Submission, SubmissionStatus } from '../../entities/index.js'
import type { ISubmissionRepository } from '../../repositories/index.js'
import type { Result } from '../types.js'

export interface ReviewSubmissionDTO {
  submissionId: string
  status: Extract<SubmissionStatus, 'reviewed' | 'shortlisted' | 'rejected'>
  feedback?: string
}

export class ReviewSubmissionUseCase {
  constructor(private readonly submissionRepo: ISubmissionRepository) {}

  async execute(dto: ReviewSubmissionDTO): Promise<Result<Submission>> {
    const submission = await this.submissionRepo.findById(dto.submissionId)
    if (!submission) {
      return { ok: false, error: new Error('Submission not found') }
    }

    if (submission.status !== 'pending') {
      return { ok: false, error: new Error('Only pending submissions can be reviewed') }
    }

    const updated: Submission = {
      ...submission,
      status: dto.status,
      feedback: dto.feedback ?? submission.feedback,
      updatedAt: new Date(),
    }

    const saved = await this.submissionRepo.update(updated)
    return { ok: true, data: saved }
  }
}
