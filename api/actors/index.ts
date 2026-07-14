import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ListActorsUseCase } from '@masterai/core'
import { PrismaActorRepository } from '@masterai/infrastructure/repositories'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const search = req.query.search as string | undefined
  const useCase = new ListActorsUseCase(new PrismaActorRepository())
  const result = await useCase.execute({ search })

  if (!result.ok) {
    return res.status(500).json({ error: result.error.message })
  }

  return res.status(200).json(result.data)
}
