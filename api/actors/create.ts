import type { VercelRequest, VercelResponse } from '@vercel/node'
import { CreateActorSchema } from '@masterai/infrastructure'
import { CreateActorUseCase } from '@masterai/core'
import { PrismaActorRepository } from '@masterai/infrastructure/repositories'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const parsed = CreateActorSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const useCase = new CreateActorUseCase(new PrismaActorRepository())
  const result = await useCase.execute(parsed.data)
  if (!result.ok) {
    return res.status(409).json({ error: result.error.message })
  }

  return res.status(201).json(result.data)
}
