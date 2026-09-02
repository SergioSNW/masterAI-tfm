import { post } from './api'
import type { CastingDTO } from './types'

const ACTOR_ID = process.env.EXPO_PUBLIC_ACTOR_ID ?? 'a1'

export interface UploadResult {
  id: string
  status: string
  feedback?: string
  submittedAt: string
}

export async function submitCloudinaryVideo(
  casting: CastingDTO,
  videoUrl: string,
  notes?: string,
): Promise<UploadResult> {
  const result = await post<{ id: string; status: string; feedback?: string; createdAt: string }>(
    '/submissions',
    { castingId: casting.id, actorId: ACTOR_ID, videoUrl, notes },
  ).catch(() => null)

  if (result) {
    return {
      id: result.id,
      status: result.status,
      feedback: result.feedback,
      submittedAt: result.createdAt,
    }
  }

  return {
    id: `local-${Date.now()}`,
    status: 'pending',
    submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  }
}

