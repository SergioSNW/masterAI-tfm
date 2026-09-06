import { get } from './api'

export interface CommentDTO {
  id: string
  submissionId: string
  authorName: string
  content: string
  createdAt: string
}

export async function fetchComments(submissionId: string): Promise<CommentDTO[]> {
  return get<CommentDTO[]>(`/submissions/comments?submissionId=${encodeURIComponent(submissionId)}`)
}
