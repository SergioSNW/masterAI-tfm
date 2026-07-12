import { z } from 'zod'

export const CreateRoundSchema = z.object({
  castingId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  deadline: z.string().datetime().optional().transform(v => (v ? new Date(v) : undefined)),
  order: z.number().int().min(0),
})

export const OpenRoundSchema = z.object({
  roundId: z.string().uuid(),
})

export const CloseRoundSchema = z.object({
  roundId: z.string().uuid(),
})
