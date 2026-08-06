import { z } from 'zod'

export const CreateCastingSchema = z.object({
  projectId: z.string().min(1),
  roleName: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  requirements: z.string().max(2000).optional(),
})

export const CloseCastingSchema = z.object({
  castingId: z.string().min(1),
})

export const UpdateCastingPhaseSchema = z.object({
  castingId: z.string().min(1),
  activePhase: z.string().min(1).max(100),
})
