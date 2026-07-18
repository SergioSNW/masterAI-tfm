import { post } from './api'

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
