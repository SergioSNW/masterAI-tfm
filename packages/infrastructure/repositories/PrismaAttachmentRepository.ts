import type { Attachment } from '@masterai/core'
import type { IAttachmentRepository } from '@masterai/core'
import { prisma } from '../database/client'

export class PrismaAttachmentRepository implements IAttachmentRepository {
  async findById(id: string): Promise<Attachment | null> {
    return prisma.attachment.findUnique({ where: { id } }) as Promise<Attachment | null>
  }

  async findByRoundId(roundId: string): Promise<Attachment[]> {
    return prisma.attachment.findMany({
      where: { roundId },
      orderBy: { createdAt: 'desc' },
    }) as Promise<Attachment[]>
  }

  async create(attachment: Attachment): Promise<Attachment> {
    return prisma.attachment.create({ data: attachment }) as Promise<Attachment>
  }

  async delete(id: string): Promise<void> {
    await prisma.attachment.delete({ where: { id } })
  }
}
