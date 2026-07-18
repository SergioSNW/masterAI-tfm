import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ListAttachmentsSchema } from '@masterai/infrastructure'
import { ListAttachmentsUseCase } from '@masterai/core'
import {
  PrismaAttachmentRepository,
  PrismaRoundRepository,
} from '@masterai/infrastructure/repositories'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const parsed = ListAttachmentsSchema.safeParse(req.query)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const useCase = new ListAttachmentsUseCase(
    new PrismaAttachmentRepository(),
    new PrismaRoundRepository(),
  )

  const result = await useCase.execute(parsed.data)
  if (!result.ok) {
    return res.status(400).json({ error: result.error.message })
  }

  return res.status(200).json(result.data)
}
