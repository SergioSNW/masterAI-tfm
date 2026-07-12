import { z } from 'zod'

export const CreateCastingSchema = z.object({
  projectId: z.string().uuid(),
  roleName: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  requirements: z.string().max(2000).optional(),
})

export const CloseCastingSchema = z.object({
  castingId: z.string().uuid(),
})
