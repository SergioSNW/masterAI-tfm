import type { VercelRequest, VercelResponse } from '@vercel/node'
import { CloseProjectSchema } from '@masterai/infrastructure'
import { CloseProjectUseCase } from '@masterai/core'
import { PrismaProjectRepository } from '@masterai/infrastructure/repositories'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const parsed = CloseProjectSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const useCase = new CloseProjectUseCase(new PrismaProjectRepository())
  const result = await useCase.execute(parsed.data)
  if (!result.ok) {
    return res.status(400).json({ error: result.error.message })
  }

  return res.status(200).json(result.data)
}
