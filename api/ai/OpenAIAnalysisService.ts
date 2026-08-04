import OpenAI, { APIError, RateLimitError } from 'openai'
import type { AIAnalysisResult, IAIAnalysisService } from '@masterai/core'
import { AIServiceError } from '@masterai/core'

interface AIEvaluation {
  score: number
  feedback: string
}

const WHISPER_MODEL = 'whisper-1'
const EVALUATION_MODEL = 'gpt-4o-mini'

export class OpenAIAnalysisService implements IAIAnalysisService {
  private client: OpenAI | null = null

  private getClient(): OpenAI {
    if (this.client) return this.client
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new AIServiceError('OPENAI_API_KEY is not configured', 500)
    }
    this.client = new OpenAI({ apiKey })
    return this.client
  }

  async analyzeAudio(videoUrl: string, requirements?: string): Promise<AIAnalysisResult> {
    const client = this.getClient()

    let media: Response
    try {
      media = await fetch(videoUrl)
    } catch {
      throw new AIServiceError('Failed to fetch submission video', 502)
    }
    if (!media.ok) {
      throw new AIServiceError(`Failed to fetch submission video (HTTP ${media.status})`, 502)
    }

    try {
      const transcription = await client.audio.transcriptions.create({
        file: media,
        model: WHISPER_MODEL,
        response_format: 'json',
      })

      const transcript = transcription.text.trim()
      const evaluation = await this.evaluate(client, transcript, requirements)

      return { transcript, score: evaluation.score, feedback: evaluation.feedback }
    } catch (err) {
      throw this.mapError(err)
    }
  }

  private async evaluate(client: OpenAI, transcript: string, requirements?: string): Promise<AIEvaluation> {
    const requirementsBlock = requirements?.trim()
      ? `\n\nCasting requirements:\n${requirements.trim()}`
      : ''

    const completion = await client.chat.completions.create({
      model: EVALUATION_MODEL,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are an experienced casting director evaluating an actor self-tape submission audio.' +
            'Respond with JSON only, in this exact shape: {"score": number from 0 to 100, "feedback": string (2-3 concise sentences)}.' +
            requirementsBlock,
        },
        {
          role: 'user',
          content:
            'Transcript of the submission audio:\n"""\n' +
            transcript +
            '\n"""\n\nEvaluate this performance against the casting requirements. ' +
            'Consider delivery, clarity, tone, and alignment with the requested role.',
        },
      ],
    })

    const content = completion.choices[0]?.message?.content ?? ''
    return this.parseEvaluation(content)
  }

  private parseEvaluation(content: string): AIEvaluation {
    let raw: unknown
    try {
      raw = JSON.parse(content)
    } catch {
      throw new AIServiceError('AI evaluation returned invalid JSON', 502)
    }

    const obj = raw as { score?: unknown; feedback?: unknown }
    if (typeof obj.score !== 'number' || typeof obj.feedback !== 'string') {
      throw new AIServiceError('AI evaluation response is missing required fields', 502)
    }

    const score = Math.max(0, Math.min(100, Math.round(obj.score)))
    return { score, feedback: obj.feedback }
  }

  private mapError(err: unknown): Error {
    if (err instanceof AIServiceError) return err
    if (err instanceof RateLimitError) {
      return new AIServiceError('OpenAI rate limit exceeded, please retry later', 429)
    }
    if (err instanceof APIError) {
      if (err.status === 401 || err.status === 403) {
        return new AIServiceError('OpenAI authentication failed, check OPENAI_API_KEY', 400)
      }
      if (err.status && err.status >= 500) {
        return new AIServiceError('OpenAI service is unavailable, please retry later', 503)
      }
      return new AIServiceError(`OpenAI request failed (status ${err.status ?? 'unknown'})`, 400)
    }
    return new AIServiceError(err instanceof Error ? err.message : 'AI analysis failed', 500)
  }
}
