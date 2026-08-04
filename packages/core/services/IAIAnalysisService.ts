export interface AIAnalysisResult {
  transcript: string
  score: number
  feedback: string
}

export interface IAIAnalysisService {
  analyzeAudio(videoUrl: string, requirements?: string): Promise<AIAnalysisResult>
}

export class AIServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message)
    this.name = 'AIServiceError'
  }
}
