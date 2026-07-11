export type CastingStatus = 'open' | 'closed' | 'cancelled'

export interface Casting {
  id: string
  projectId: string
  roleName: string
  description?: string
  requirements?: string
  status: CastingStatus
  createdAt: Date
  updatedAt: Date
}
