import { get, put } from './api'

export interface CastingDTO {
  id: string
  projectId: string
  roleName: string
  description?: string
  requirements?: string
  status: string
  activePhase?: string
  createdAt: string
  updatedAt: string
}

export interface OpenCastingDTO {
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

export async function fetchOpenCastings(actorId: string): Promise<OpenCastingDTO[]> {
  return get<OpenCastingDTO[]>(`/castings?actorId=${encodeURIComponent(actorId)}`)
}

export async function updateCastingPhase(id: string, activePhase: string): Promise<CastingDTO> {
  return put<CastingDTO>(`/castings/${id}/phase`, { activePhase })
}
