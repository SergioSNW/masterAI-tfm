export interface Actor {
  id: string
  name: string
  email: string
  avatarColor: string
}

export interface Submission {
  id: string
  actorId: string
  actorName: string
  actorEmail: string
  avatarColor: string
  videoUrl: string
  thumbnailUrl?: string
  notes?: string
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected'
  feedback?: string
  createdAt: string
}

export interface Round {
  id: string
  castingId: string
  name: string
  description?: string
  deadline?: string
  order: number
  status: 'pending' | 'open' | 'closed'
  submissions: Submission[]
}

export interface Casting {
  id: string
  projectId: string
  roleName: string
  description?: string
  requirements?: string
  status: 'open' | 'closed' | 'cancelled'
  rounds: Round[]
}

export interface Project {
  id: string
  title: string
  description?: string
  status: 'draft' | 'active' | 'closed'
  castings: Casting[]
}
