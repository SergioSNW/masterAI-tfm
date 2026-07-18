import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ListCommentsSchema } from '@masterai/infrastructure'
import { ListCommentsUseCase } from '@masterai/core'
import {
  PrismaCommentRepository,
  PrismaSubmissionRepository,
} from '@masterai/infrastructure/repositories'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const parsed = ListCommentsSchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const useCase = new ListCommentsUseCase(
    new PrismaCommentRepository(),
    new PrismaSubmissionRepository(),
  )

  const result = await useCase.execute(parsed.data)
  if (!result.ok) {
    return res.status(400).json({ error: result.error.message })
  }

  return res.status(200).json(result.data)
}
