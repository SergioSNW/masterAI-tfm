import type { Attachment } from '../entities'

export interface IAttachmentRepository {
  findById(id: string): Promise<Attachment | null>
  findByRoundId(roundId: string): Promise<Attachment[]>
  create(attachment: Attachment): Promise<Attachment>
  delete(id: string): Promise<void>
}
