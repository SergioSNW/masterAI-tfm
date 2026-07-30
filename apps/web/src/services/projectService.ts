import { post, put } from './api'

export interface CreateProjectInput {
  title: string
  description?: string
}

export interface ProjectDTO {
  id: string
  title: string
  description?: string
  status: 'draft' | 'active' | 'closed'
  createdAt: string
  updatedAt: string
}

export async function createProject(input: CreateProjectInput): Promise<ProjectDTO> {
  return post<ProjectDTO>('/projects/create', { ...input, directorId: 'd1' })
}

export async function updateProjectStatus(id: string, status: string): Promise<ProjectDTO> {
  return put<ProjectDTO>(`/projects/${id}/status`, { status })
}
