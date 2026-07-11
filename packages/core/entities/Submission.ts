export type SubmissionStatus = 'pending' | 'reviewed' | 'shortlisted' | 'rejected'

export interface Submission {
  id: string
  roundId: string
  actorId: string
  videoUrl: string
  thumbnailUrl?: string
  notes?: string
  status: SubmissionStatus
  feedback?: string
  createdAt: Date
  updatedAt: Date
}
