import type { Attachment } from '../../entities'
import type { IAttachmentRepository, IRoundRepository } from '../../repositories'
import type { Result } from '../types'

const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'text/plain']
const MAX_SIZE_BYTES = 10 * 1024 * 1024

export interface AddAttachmentDTO {
  roundId: string
  fileName: string
  fileType: string
  fileData: string
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
      return { ok: false, error: new Error(`File exceeds 10MB limit (${(dto.fileSize / 1024 / 1024).toFixed(1)}MB)`) }
    }

    const attachment: Attachment = {
      id: crypto.randomUUID(),
      roundId: dto.roundId,
      fileName: dto.fileName,
      fileType: dto.fileType,
      fileData: dto.fileData,
      fileSize: dto.fileSize,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const created = await this.attachmentRepo.create(attachment)
    return { ok: true, data: created }
  }
}
