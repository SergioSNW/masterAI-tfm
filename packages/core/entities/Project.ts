export type ProjectStatus = 'draft' | 'active' | 'closed'

export interface Project {
  id: string
  directorId: string
  title: string
  description?: string
  status: ProjectStatus
  createdAt: Date
  updatedAt: Date
}
