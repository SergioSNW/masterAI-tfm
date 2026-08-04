import { z } from 'zod'

export const SubmitVideoSchema = z.object({
  roundId: z.string().uuid(),
  actorId: z.string().uuid(),
  videoUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  notes: z.string().max(2000).optional(),
})

export const CreateSubmissionSchema = z.object({
  castingId: z.string().min(1),
  actorId: z.string().min(1),
  videoUrl: z.string().url().min(1, 'Video URL is required'),
  notes: z.string().max(2000).optional(),
})

export const ManualUploadSchema = z.object({
  roundId: z.string().uuid(),
  actorId: z.string().uuid(),
  videoData: z.string().min(1, 'Video data is required'),
  fileName: z.string().min(1, 'File name is required').max(200),
  notes: z.string().max(2000).optional(),
})

export const ReviewSubmissionSchema = z.object({
  submissionId: z.string().uuid(),
  status: z.enum(['reviewed', 'shortlisted', 'rejected']),
  feedback: z.string().max(2000).optional(),
})

export const AnalyzeSubmissionSchema = z.object({
  submissionId: z.string().min(1, 'Submission ID is required'),
})
