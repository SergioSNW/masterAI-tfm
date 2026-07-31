import type { Attachment } from '../../entities/index.js'
import type { IAttachmentRepository, IRoundRepository } from '../../repositories/index.js'
import type { Result } from '../types.js'

const MAX_SIZE_BYTES = 50 * 1024 * 1024

export interface AddAttachmentDTO {
  roundId: string
  fileName: string
  fileType: string
  url: string
  fileSize: number
}

export class AddAttachmentUseCase {
  constructor(
    private readonly attachmentRepo: IAttachmentRepository,
    private readonly roundRepo: IRoundRepository,
  ) {}

  async execute(dto: AddAttachmentDTO): Promise<Result<Attachment>> {
    const round = await this.roundRepo.findById(dto.roundId)
    if (!round) {
      return { ok: false, error: new Error('Round not found') }
    }

    if (!dto.fileName.trim()) {
      return { ok: false, error: new Error('File name is required') }
    }

    if (dto.fileSize > MAX_SIZE_BYTES) {
      return { ok: false, error: new Error(`File exceeds 50MB limit (${(dto.fileSize / 1024 / 1024).toFixed(1)}MB)`) }
    }

    const attachment: Attachment = {
      id: crypto.randomUUID(),
      roundId: dto.roundId,
      fileName: dto.fileName,
      fileType: dto.fileType,
      url: dto.url,
      fileSize: dto.fileSize,
      createdAt: new Date(),
    }

    const created = await this.attachmentRepo.create(attachment)
    return { ok: true, data: created }
  }
}
