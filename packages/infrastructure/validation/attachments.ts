import { z } from 'zod'

export const AddAttachmentSchema = z.object({
  roundId: z.string().uuid(),
  fileName: z.string().min(1).max(300),
  fileType: z.string().min(1).max(100),
  fileData: z.string().min(1),
  fileSize: z.number().int().positive(),
})

export const ListAttachmentsSchema = z.object({
  roundId: z.string().uuid(),
})
