import { z } from 'zod'

export const CreateActorSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(200),
  phone: z.string().max(30).optional(),
  profilePictureUrl: z.string().url().optional(),
  bio: z.string().max(2000).optional(),
  agency: z.string().max(200).optional(),
  availability: z.string().max(50).optional(),
  preferredRoles: z.string().max(500).optional(),
  castingStage: z.string().max(50).optional(),
})

export const UpdateActorSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().optional(),
  name: z.string().min(1).max(200).optional(),
  phone: z.string().max(30).nullable().optional(),
  profilePictureUrl: z.string().url().nullable().optional(),
  bio: z.string().max(2000).nullable().optional(),
  agency: z.string().max(200).nullable().optional(),
  availability: z.string().max(50).optional(),
  preferredRoles: z.string().max(500).nullable().optional(),
  castingStage: z.string().max(50).optional(),
})
