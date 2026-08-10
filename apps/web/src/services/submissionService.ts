import { post, get } from './api'

export interface SubmissionDTO {
  id: string
  roundId: string
  actorId: string
  videoUrl: string
  notes?: string
  status: string
  feedback?: string
  createdAt: string
}

export interface UploadVideoInput {
  roundId: string
  actorId: string
  videoData: string
  fileName: string
  notes?: string
}

export interface ReviewInput {
  submissionId: string
  status: 'shortlisted' | 'reviewed' | 'rejected'
  feedback?: string
}

export interface CreateSubmissionInput {
  castingId: string
  actorId: string
  videoUrl: string
  notes?: string
}

export async function createSubmission(input: CreateSubmissionInput): Promise<SubmissionDTO> {
  return post<SubmissionDTO>('/submissions', input)
}

export async function uploadVideo(input: UploadVideoInput): Promise<SubmissionDTO> {
  return post<SubmissionDTO>('/submissions/upload', input)
}

export async function fetchSubmissions(roundId: string): Promise<SubmissionDTO[]> {
  return get<SubmissionDTO[]>(`/submissions?roundId=${roundId}`)
}

export async function reviewSubmission(input: ReviewInput): Promise<void> {
  await post('/submissions/review', input)
}

export interface AnalyzeInput {
  submissionId: string
}

export interface AnalyzeResult {
  transcript?: string
  aiScore?: number
  aiFeedback?: string
}

export async function analyzeSubmission(input: AnalyzeInput): Promise<AnalyzeResult> {
  const res = await post<{ transcript?: string; aiScore?: number; aiFeedback?: string }>('/analyze', input)
  return {
    transcript: res.transcript,
    aiScore: res.aiScore,
    aiFeedback: res.aiFeedback,
  }
}
