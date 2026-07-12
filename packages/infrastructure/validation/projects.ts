import { z } from 'zod'

export const CreateProjectSchema = z.object({
  directorId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
})

export const CloseProjectSchema = z.object({
  projectId: z.string().uuid(),
  directorId: z.string().uuid(),
})
