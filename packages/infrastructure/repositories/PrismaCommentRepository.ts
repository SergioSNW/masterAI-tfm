import type { Comment } from '@masterai/core'
import type { ICommentRepository } from '@masterai/core'
import { prisma } from '../database/client'

export class PrismaCommentRepository implements ICommentRepository {
  async findById(id: string): Promise<Comment | null> {
    return prisma.comment.findUnique({ where: { id } }) as Promise<Comment | null>
  }

  async findBySubmissionId(submissionId: string): Promise<Comment[]> {
    return prisma.comment.findMany({
      where: { submissionId },
      orderBy: { createdAt: 'asc' },
    }) as Promise<Comment[]>
  }

  async create(comment: Comment): Promise<Comment> {
    return prisma.comment.create({ data: comment }) as Promise<Comment>
  }

  async delete(id: string): Promise<void> {
    await prisma.comment.delete({ where: { id } })
  }
}
