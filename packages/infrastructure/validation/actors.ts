import { z } from 'zod'

export const CreateActorSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(200),
  phone: z.string().max(30).optional(),
  profilePictureUrl: z.string().url().optional(),
})
