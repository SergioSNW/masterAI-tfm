import { z } from 'zod'

export const CreateCommentSchema = z.object({
  submissionId: z.string().uuid(),
  authorName: z.string().min(1).max(200),
  content: z.string().min(1).max(2000),
})

export const ListCommentsSchema = z.object({
  submissionId: z.string().uuid(),
})
