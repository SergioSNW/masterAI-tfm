import { post } from './api'

export interface CreateRoundInput {
  castingId: string
  name: string
  description?: string
  deadline?: string
  order: number
}

export interface RoundDTO {
  id: string
  castingId: string
  name: string
  description?: string
  deadline?: string
  order: number
  status: string
  createdAt: string
  updatedAt: string
}

export async function createRound(input: CreateRoundInput): Promise<RoundDTO> {
  return post<RoundDTO>('/rounds/create', input)
}

export async function openRound(roundId: string): Promise<RoundDTO> {
  return post<RoundDTO>('/rounds/open', { roundId })
}

export async function closeRound(roundId: string): Promise<RoundDTO> {
  return post<RoundDTO>('/rounds/close', { roundId })
}
