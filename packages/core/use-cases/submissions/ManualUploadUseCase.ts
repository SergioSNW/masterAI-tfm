import type { Submission } from '../../entities'
import type { ISubmissionRepository, IRoundRepository, IActorRepository } from '../../repositories'
import type { Result } from '../types'

const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.webm']
const MAX_SIZE_BYTES = 5 * 1024 * 1024

export interface ManualUploadDTO {
  roundId: string
  actorId: string
  videoData: string
  fileName: string
  notes?: string
}

function mimeForExtension(fileName: string): string {
  const ext = fileName.toLowerCase().slice(fileName.lastIndexOf('.'))
  const map: Record<string, string> = { '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.webm': 'video/webm' }
  return map[ext] || 'video/mp4'
}

export class ManualUploadUseCase {
  constructor(
    private readonly submissionRepo: ISubmissionRepository,
    private readonly roundRepo: IRoundRepository,
    private readonly actorRepo: IActorRepository,
  ) {}

  async execute(dto: ManualUploadDTO): Promise<Result<Submission>> {
    const ext = dto.fileName.toLowerCase().slice(dto.fileName.lastIndexOf('.'))
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return { ok: false, error: new Error(`Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`) }
    }

    const decodedSize = Math.round((dto.videoData.length * 3) / 4)
    if (decodedSize > MAX_SIZE_BYTES) {
      return { ok: false, error: new Error(`File exceeds 5MB limit (${(decodedSize / 1024 / 1024).toFixed(1)}MB)`) }
    }

    const round = await this.roundRepo.findById(dto.roundId)
    if (!round) return { ok: false, error: new Error('Round not found') }
    if (round.status !== 'open') return { ok: false, error: new Error('Round is not open for submissions') }
    if (round.deadline && new Date() > round.deadline) return { ok: false, error: new Error('Submission deadline has passed') }

    const actor = await this.actorRepo.findById(dto.actorId)
    if (!actor) return { ok: false, error: new Error('Actor not found') }

    const existing = await this.submissionRepo.findByRoundId(dto.roundId)
    if (existing.find(s => s.actorId === dto.actorId)) {
      return { ok: false, error: new Error('Actor already submitted to this round') }
    }

    const mime = mimeForExtension(dto.fileName)
    const dataUrl = `data:${mime};base64,${dto.videoData}`

    const submission: Submission = {
      id: crypto.randomUUID(),
      roundId: dto.roundId,
      actorId: dto.actorId,
      videoUrl: dataUrl,
      notes: dto.notes,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const created = await this.submissionRepo.create(submission)
    return { ok: true, data: created }
  }
}
