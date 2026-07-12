import type { Submission } from '@masterai/core'
import type { ISubmissionRepository } from '@masterai/core'
import { prisma } from '../database/client'

export class PrismaSubmissionRepository implements ISubmissionRepository {
  async findById(id: string): Promise<Submission | null> {
    return prisma.submission.findUnique({ where: { id } }) as Promise<Submission | null>
  }

  async findByRoundId(roundId: string): Promise<Submission[]> {
    return prisma.submission.findMany({ where: { roundId } }) as Promise<Submission[]>
  }

  async findByActorId(actorId: string): Promise<Submission[]> {
    return prisma.submission.findMany({ where: { actorId } }) as Promise<Submission[]>
  }

  async create(submission: Submission): Promise<Submission> {
    return prisma.submission.create({ data: submission }) as Promise<Submission>
  }

  async update(submission: Submission): Promise<Submission> {
    return prisma.submission.update({ where: { id: submission.id }, data: submission }) as Promise<Submission>
  }

  async delete(id: string): Promise<void> {
    await prisma.submission.delete({ where: { id } })
  }
}
