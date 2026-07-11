export type RoundStatus = 'pending' | 'open' | 'closed'

export interface Round {
  id: string
  castingId: string
  name: string
  description?: string
  deadline?: Date
  order: number
  status: RoundStatus
  createdAt: Date
  updatedAt: Date
}
