import type { Attachment } from '../../entities/index.js'
import type { IAttachmentRepository, IRoundRepository } from '../../repositories/index.js'
import type { Result } from '../types.js'

export interface ListAttachmentsDTO {
  roundId: string
}

export class ListAttachmentsUseCase {
  constructor(
    private readonly attachmentRepo: IAttachmentRepository,
    private readonly roundRepo: IRoundRepository,
  ) {}

  async execute(dto: ListAttachmentsDTO): Promise<Result<Attachment[]>> {
    const round = await this.roundRepo.findById(dto.roundId)
    if (!round) {
      return { ok: false, error: new Error('Round not found') }
    }

    const attachments = await this.attachmentRepo.findByRoundId(dto.roundId)
    return { ok: true, data: attachments }
  }
}
