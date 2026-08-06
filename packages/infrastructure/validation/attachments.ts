import { z } from 'zod'

export const AddAttachmentSchema = z.object({
  roundId: z.string().min(1),
  fileName: z.string().min(1).max(300),
  fileType: z.string().min(1).max(100),
  url: z.string().url(),
  fileSize: z.number().int().positive(),
})

export const ListAttachmentsSchema = z.object({
  roundId: z.string().min(1),
})
