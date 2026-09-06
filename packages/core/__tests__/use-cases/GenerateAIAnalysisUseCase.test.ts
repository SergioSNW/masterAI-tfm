import { describe, it, expect, vi } from 'vitest'
import { GenerateAIAnalysisUseCase } from '../../use-cases/submissions/GenerateAIAnalysisUseCase.js'
import { AIServiceError } from '../../services/IAIAnalysisService.js'
import type { IAIAnalysisService } from '../../services/IAIAnalysisService.js'
import type { ISubmissionRepository, IRoundRepository, ICastingRepository } from '../../repositories/index.js'
import type { Casting, Round, Submission } from '../../entities/index.js'

function mockSubmissionRepo(overrides?: Partial<ISubmissionRepository>): ISubmissionRepository {
  return {
    findById: vi.fn(),
    findByRoundId: vi.fn(),
    findByActorId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(async s => s as Submission),
    delete: vi.fn(),
    ...overrides,
  }
}

function mockRoundRepo(overrides?: Partial<IRoundRepository>): IRoundRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByCastingId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  }
}

function mockCastingRepo(overrides?: Partial<ICastingRepository>): ICastingRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByProjectId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  }
}

function mockAiService(overrides?: Partial<IAIAnalysisService>): IAIAnalysisService {
  return {
    analyzeAudio: vi.fn(),
    ...overrides,
  }
}

const submission: Submission = {
  id: 's1', roundId: 'r1', actorId: 'a1', videoUrl: 'https://cdn/video.mp4', status: 'pending',
  createdAt: new Date(), updatedAt: new Date(),
}
const round: Round = { id: 'r1', castingId: 'c1', name: 'Self-Tape', order: 0, status: 'open', createdAt: new Date(), updatedAt: new Date() }
const casting: Casting = { id: 'c1', projectId: 'p1', roleName: 'Lady Victoria', requirements: 'British accent', status: 'open', activePhase: 'First Round', createdAt: new Date(), updatedAt: new Date() }

describe('GenerateAIAnalysisUseCase', () => {
  it('rejects when the submission does not exist', async () => {
    const submissionRepo = mockSubmissionRepo({ findById: vi.fn().mockResolvedValue(null) })
    const useCase = new GenerateAIAnalysisUseCase(submissionRepo, mockRoundRepo(), mockCastingRepo(), mockAiService())

    const result = await useCase.execute({ submissionId: 'missing' })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toBe('Submission not found')
  })

  it('rejects when the submission has no video', async () => {
    const submissionRepo = mockSubmissionRepo({ findById: vi.fn().mockResolvedValue({ ...submission, videoUrl: undefined }) })
    const useCase = new GenerateAIAnalysisUseCase(submissionRepo, mockRoundRepo(), mockCastingRepo(), mockAiService())

    const result = await useCase.execute({ submissionId: 's1' })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toBe('Submission has no video to analyze')
  })

  it('passes the casting requirements through to the AI service', async () => {
    const submissionRepo = mockSubmissionRepo({ findById: vi.fn().mockResolvedValue(submission) })
    const roundRepo = mockRoundRepo({ findById: vi.fn().mockResolvedValue(round) })
    const castingRepo = mockCastingRepo({ findById: vi.fn().mockResolvedValue(casting) })
    const aiService = mockAiService({
      analyzeAudio: vi.fn().mockResolvedValue({ transcript: 'Hello world', score: 82, feedback: 'Great energy' }),
    })
    const useCase = new GenerateAIAnalysisUseCase(submissionRepo, roundRepo, castingRepo, aiService)

    const result = await useCase.execute({ submissionId: 's1' })

    expect(aiService.analyzeAudio).toHaveBeenCalledWith('https://cdn/video.mp4', 'British accent')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.transcript).toBe('Hello world')
      expect(result.data.aiScore).toBe(82)
      expect(result.data.aiFeedback).toBe('Great energy')
    }
  })

  it('analyzes without requirements when the round or casting cannot be found', async () => {
    const submissionRepo = mockSubmissionRepo({ findById: vi.fn().mockResolvedValue(submission) })
    const roundRepo = mockRoundRepo({ findById: vi.fn().mockResolvedValue(null) })
    const castingRepo = mockCastingRepo()
    const aiService = mockAiService({
      analyzeAudio: vi.fn().mockResolvedValue({ transcript: 'Hi', score: 50, feedback: 'Ok' }),
    })
    const useCase = new GenerateAIAnalysisUseCase(submissionRepo, roundRepo, castingRepo, aiService)

    await useCase.execute({ submissionId: 's1' })

    expect(aiService.analyzeAudio).toHaveBeenCalledWith('https://cdn/video.mp4', undefined)
  })

  it('passes through a typed AIServiceError from the AI service', async () => {
    const submissionRepo = mockSubmissionRepo({ findById: vi.fn().mockResolvedValue(submission) })
    const aiError = new AIServiceError('OpenAI rate limit exceeded, please retry later', 429)
    const aiService = mockAiService({ analyzeAudio: vi.fn().mockRejectedValue(aiError) })
    const useCase = new GenerateAIAnalysisUseCase(submissionRepo, mockRoundRepo(), mockCastingRepo(), aiService)

    const result = await useCase.execute({ submissionId: 's1' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe(aiError)
      expect((result.error as AIServiceError).statusCode).toBe(429)
    }
  })

  it('wraps a non-AIServiceError failure in a plain Error', async () => {
    const submissionRepo = mockSubmissionRepo({ findById: vi.fn().mockResolvedValue(submission) })
    const aiService = mockAiService({ analyzeAudio: vi.fn().mockRejectedValue(new Error('network down')) })
    const useCase = new GenerateAIAnalysisUseCase(submissionRepo, mockRoundRepo(), mockCastingRepo(), aiService)

    const result = await useCase.execute({ submissionId: 's1' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).not.toBeInstanceOf(AIServiceError)
      expect(result.error.message).toBe('network down')
    }
    expect(submissionRepo.update).not.toHaveBeenCalled()
  })
})
