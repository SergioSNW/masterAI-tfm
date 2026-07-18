export interface CastingDTO {
  id: string
  title: string
  projectName: string
  role: string
  deadline: string
  status: string
  roundId?: string
  submission?: {
    status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | null
    feedback?: string
    submittedAt?: string
  }
}

export interface ActorDTO {
  id: string
  name: string
  email: string
  phone?: string
  profilePictureUrl?: string
}

export interface RoundDTO {
  id: string
  castingId: string
  name: string
  status: string
  deadline?: string
}
