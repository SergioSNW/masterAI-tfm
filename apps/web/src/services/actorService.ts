import { get, post, put, del } from './api'

export interface ActorDTO {
  id: string
  email: string
  name: string
  phone?: string
  profilePictureUrl?: string
  bio?: string
  agency?: string
  availability?: string
  preferredRoles?: string
  castingStage?: string
  createdAt: string
  updatedAt: string
}

export interface CreateActorInput {
  email: string
  name: string
  phone?: string
  profilePictureUrl?: string
  bio?: string
  agency?: string
  availability?: string
  preferredRoles?: string
  castingStage?: string
}

export interface UpdateActorInput {
  id: string
  name?: string
  email?: string
  phone?: string
  profilePictureUrl?: string
  bio?: string
  agency?: string
  availability?: string
  preferredRoles?: string
  castingStage?: string
}

let localActors: ActorDTO[] = []

export async function fetchActors(search?: string): Promise<ActorDTO[]> {
  const data = await get<ActorDTO[]>(`/actors${search ? `?search=${encodeURIComponent(search)}` : ''}`)
  localActors = data
  return data
}

export async function createActor(input: CreateActorInput): Promise<ActorDTO> {
  const newActor: ActorDTO = {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    email: input.email,
    name: input.name,
    phone: input.phone,
    profilePictureUrl: input.profilePictureUrl,
    bio: input.bio,
    agency: input.agency,
    availability: input.availability ?? 'Available',
    preferredRoles: input.preferredRoles,
    castingStage: input.castingStage ?? 'Pending',
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

export async function updateActor(input: UpdateActorInput): Promise<ActorDTO> {
  const result = await put<ActorDTO>(`/actors/${input.id}`, input).catch(() => null)
  if (result) {
    localActors = localActors.map(a => a.id === result.id ? result : a)
    return result
  }
  const existing = localActors.find(a => a.id === input.id)
  if (existing) {
    const updated = { ...existing, ...input, updatedAt: new Date().toISOString() }
    localActors = localActors.map(a => a.id === updated.id ? updated : a)
    return updated
  }
  throw new Error('Actor not found')
}

export async function deleteActor(id: string): Promise<void> {
  await del(`/actors/${id}`).catch(() => {})
  localActors = localActors.filter(a => a.id !== id)
}
