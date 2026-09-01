import type { IAttachmentRepository } from '../../repositories/index.js'
import type { Result } from '../types.js'

export class RemoveAttachmentUseCase {
  constructor(private readonly attachmentRepo: IAttachmentRepository) {}

  async execute(id: string): Promise<Result<void>> {
    const existing = await this.attachmentRepo.findById(id)
    if (!existing) {
      return { ok: false, error: new Error('Attachment not found') }
    }

    await this.attachmentRepo.delete(id)
    return { ok: true, data: undefined }
  }
}
