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

export async function uploadVideo(input: UploadVideoInput): Promise<SubmissionDTO> {
  return post<SubmissionDTO>('/submissions/upload', input)
}

export async function fetchSubmissions(roundId: string): Promise<SubmissionDTO[]> {
  return get<SubmissionDTO[]>(`/submissions?roundId=${roundId}`)
}
