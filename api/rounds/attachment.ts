import type { VercelRequest, VercelResponse } from '@vercel/node'
import { AddAttachmentSchema } from '@masterai/infrastructure'
import { AddAttachmentUseCase } from '@masterai/core'
import {
  PrismaAttachmentRepository,
  PrismaRoundRepository,
} from '@masterai/infrastructure/repositories'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const parsed = AddAttachmentSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }

  const useCase = new AddAttachmentUseCase(
    new PrismaAttachmentRepository(),
    new PrismaRoundRepository(),
  )

  const result = await useCase.execute(parsed.data)
  if (!result.ok) {
    return res.status(400).json({ error: result.error.message })
  }

  return res.status(201).json(result.data)
}
