import type { Submission } from '../../entities/index.js'
import type { ISubmissionRepository, IRoundRepository, ICastingRepository } from '../../repositories/index.js'
import type { IAIAnalysisService } from '../../services/IAIAnalysisService.js'
import { AIServiceError } from '../../services/IAIAnalysisService.js'
import type { Result } from '../types.js'

export interface GenerateAIAnalysisDTO {
  submissionId: string
}

export class GenerateAIAnalysisUseCase {
  constructor(
    private readonly submissionRepo: ISubmissionRepository,
    private readonly roundRepo: IRoundRepository,
    private readonly castingRepo: ICastingRepository,
    private readonly aiService: IAIAnalysisService,
  ) {}

  async execute(dto: GenerateAIAnalysisDTO): Promise<Result<Submission>> {
    const submission = await this.submissionRepo.findById(dto.submissionId)
    if (!submission) {
      return { ok: false, error: new Error('Submission not found') }
    }
    if (!submission.videoUrl) {
      return { ok: false, error: new Error('Submission has no video to analyze') }
    }

    const round = await this.roundRepo.findById(submission.roundId)
    const casting = round ? await this.castingRepo.findById(round.castingId) : null

    let analysis
    try {
      analysis = await this.aiService.analyzeAudio(submission.videoUrl, casting?.requirements ?? undefined)
    } catch (err) {
      if (err instanceof AIServiceError) {
        return { ok: false, error: err }
      }
      return { ok: false, error: new Error(err instanceof Error ? err.message : 'AI analysis failed') }
    }

    const updated: Submission = {
      ...submission,
      transcript: analysis.transcript,
      aiScore: analysis.score,
      aiFeedback: analysis.feedback,
      updatedAt: new Date(),
    }

    const saved = await this.submissionRepo.update(updated)
    return { ok: true, data: saved }
  }
}
