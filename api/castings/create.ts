import type { VercelRequest, VercelResponse } from '@vercel/node'
import { CreateCastingSchema } from '@masterai/infrastructure'
import { CreateCastingUseCase } from '@masterai/core'
import { PrismaCastingRepository, PrismaProjectRepository } from '@masterai/infrastructure/repositories'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const parsed = CreateCastingSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const useCase = new CreateCastingUseCase(
    new PrismaCastingRepository(),
    new PrismaProjectRepository(),
  )

  const result = await useCase.execute(parsed.data)
  if (!result.ok) {
    return res.status(400).json({ error: result.error.message })
  }

  return res.status(201).json(result.data)
}
