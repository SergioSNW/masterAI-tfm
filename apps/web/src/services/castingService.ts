import { put } from './api'

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

export async function updateCastingPhase(id: string, activePhase: string): Promise<CastingDTO> {
  return put<CastingDTO>(`/castings/${id}/phase`, { activePhase })
}
