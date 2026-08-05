import { get } from './api'
import type { CastingDTO } from './types'

const ACTOR_ID = process.env.EXPO_PUBLIC_ACTOR_ID ?? 'a1'

interface RawCastingDTO {
  id: string
  title: string
  projectName: string
  role: string
  description?: string
  requirements?: string
  deadline?: string
  status: string
  roundId?: string
  submission?: {
    status: string
    feedback?: string
    submittedAt?: string
  }
}

function formatDate(iso?: string): string {
  if (!iso) return 'TBD'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export async function fetchOpenCastings(): Promise<CastingDTO[]> {
  const items = await get<RawCastingDTO[]>(`/castings?actorId=${encodeURIComponent(ACTOR_ID)}`)
  return items.map(item => ({
    id: item.id,
    title: item.title,
    projectName: item.projectName,
    role: item.role,
    description: item.description,
    requirements: item.requirements,
    deadline: formatDate(item.deadline),
    status: item.status,
    roundId: item.roundId,
    submission: item.submission
      ? {
          status: item.submission.status as 'pending' | 'reviewed' | 'shortlisted' | 'rejected',
          feedback: item.submission.feedback,
          submittedAt: formatDate(item.submission.submittedAt),
        }
      : undefined,
  }))
}
