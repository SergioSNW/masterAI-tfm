import { get, post } from './api'

export interface ActorDTO {
  id: string
  email: string
  name: string
  phone?: string
  profilePictureUrl?: string
  createdAt: string
  updatedAt: string
}

export interface CreateActorInput {
  email: string
  name: string
  phone?: string
  profilePictureUrl?: string
}

export async function fetchActors(search?: string): Promise<ActorDTO[]> {
  const params = search ? `?search=${encodeURIComponent(search)}` : ''
  return get<ActorDTO[]>(`/actors${params}`)
}

export async function createActor(input: CreateActorInput): Promise<ActorDTO> {
  return post<ActorDTO>('/actors/create', input)
}
