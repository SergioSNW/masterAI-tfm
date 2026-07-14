import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ManualUploadSchema } from '@masterai/infrastructure'
import { ManualUploadUseCase } from '@masterai/core'
import {
  PrismaSubmissionRepository,
  PrismaRoundRepository,
  PrismaActorRepository,
} from '@masterai/infrastructure/repositories'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const parsed = ManualUploadSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const useCase = new ManualUploadUseCase(
    new PrismaSubmissionRepository(),
    new PrismaRoundRepository(),
    new PrismaActorRepository(),
  )

  const result = await useCase.execute(parsed.data)
  if (!result.ok) {
    return res.status(400).json({ error: result.error.message })
  }

  return res.status(201).json(result.data)
}
