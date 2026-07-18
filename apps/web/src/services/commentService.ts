import { post, get } from './api'

export interface CommentDTO {
  id: string
  submissionId: string
  authorName: string
  content: string
  createdAt: string
}

export interface CreateCommentInput {
  submissionId: string
  authorName: string
  content: string
}

let localComments: CommentDTO[] = []

export async function fetchComments(submissionId: string): Promise<CommentDTO[]> {
  const data = await get<CommentDTO[]>(`/submissions/comments?submissionId=${submissionId}`).catch(() => null)
  if (data) {
    localComments = [...localComments.filter(c => c.submissionId !== submissionId), ...data]
    return data
  }
  return localComments.filter(c => c.submissionId === submissionId)
}

export async function createComment(input: CreateCommentInput): Promise<CommentDTO> {
  const newComment: CommentDTO = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    ...input,
    createdAt: new Date().toISOString(),
  }
  const result = await post<CommentDTO>('/submissions/comment', input).catch(() => null)
  if (result) {
    localComments.push(result)
    return result
  }
  localComments.push(newComment)
  return newComment
}
