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

let localActors: ActorDTO[] = []

export async function fetchActors(search?: string): Promise<ActorDTO[]> {
  const data = await get<ActorDTO[]>(`/actors${search ? `?search=${encodeURIComponent(search)}` : ''}`).catch(() => null)
  if (data) {
    localActors = data
    return data
  }
  if (search) {
    const q = search.toLowerCase()
    return localActors.filter(a => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q))
  }
  return localActors
}

export async function createActor(input: CreateActorInput): Promise<ActorDTO> {
  const newActor: ActorDTO = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    ...input,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const result = await post<ActorDTO>('/actors/create', input).catch(() => null)
  if (result) {
    localActors.push(result)
    return result
  }
  localActors.push(newActor)
  return newActor
}
