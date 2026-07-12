import { z } from 'zod'

export const SubmitVideoSchema = z.object({
  roundId: z.string().uuid(),
  actorId: z.string().uuid(),
  videoUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  notes: z.string().max(2000).optional(),
})

export const ReviewSubmissionSchema = z.object({
  submissionId: z.string().uuid(),
  status: z.enum(['reviewed', 'shortlisted', 'rejected']),
  feedback: z.string().max(2000).optional(),
})
