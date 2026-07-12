import type { VercelRequest, VercelResponse } from '@vercel/node'
import { CloseCastingSchema } from '@masterai/infrastructure'
import { CloseCastingUseCase } from '@masterai/core'
import { PrismaCastingRepository } from '@masterai/infrastructure/repositories'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const parsed = CloseCastingSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const useCase = new CloseCastingUseCase(new PrismaCastingRepository())
  const result = await useCase.execute(parsed.data)
  if (!result.ok) {
    return res.status(400).json({ error: result.error.message })
  }

  return res.status(200).json(result.data)
}
