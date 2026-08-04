import { get, post, put } from './api'
import type { Project, Casting, Round, Submission } from '../data/mock'

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

const AVATAR_COLORS = ['#6366f1', '#a855f7', '#ec4899', '#22c55e', '#eab308', '#06b6d4', '#f97316']

function avatarColor(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

interface DashboardSubmissionDTO {
  id: string
  actorId: string
  actorName: string
  actorEmail: string
  videoUrl: string
  thumbnailUrl?: string
  notes?: string
  status: string
  feedback?: string
  createdAt: string
}

interface DashboardRoundDTO {
  id: string
  castingId: string
  name: string
  description?: string
  deadline?: string
  order: number
  status: string
  submissions: DashboardSubmissionDTO[]
}

interface DashboardCastingDTO {
  id: string
  projectId: string
  roleName: string
  description?: string
  requirements?: string
  status: string
  activePhase?: string
  rounds: DashboardRoundDTO[]
}

interface DashboardProjectDTO {
  id: string
  title: string
  description?: string
  status: string
  castings: DashboardCastingDTO[]
}

export async function fetchDashboard(): Promise<Project[]> {
  const data = await get<DashboardProjectDTO[]>('/dashboard')
  return data.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description,
    status: p.status as Project['status'],
    castings: p.castings.map(c => ({
      id: c.id,
      projectId: c.projectId,
      roleName: c.roleName,
      description: c.description,
      requirements: c.requirements,
      status: c.status as Casting['status'],
      rounds: c.rounds.map(r => ({
        id: r.id,
        castingId: r.castingId,
        name: r.name,
        description: r.description,
        deadline: r.deadline,
        order: r.order,
        status: r.status as Round['status'],
        submissions: r.submissions.map(s => ({
          id: s.id,
          actorId: s.actorId,
          actorName: s.actorName,
          actorEmail: s.actorEmail,
          avatarColor: avatarColor(s.actorId),
          videoUrl: s.videoUrl,
          thumbnailUrl: s.thumbnailUrl,
          notes: s.notes,
          status: s.status as Submission['status'],
          feedback: s.feedback,
          createdAt: s.createdAt,
        })),
      })),
    })),
  }))
}
