export interface Actor {
  id: string
  email: string
  name: string
  profilePictureUrl?: string
  phone?: string
  bio?: string
  agency?: string
  availability: string
  preferredRoles?: string
  castingStage: string
  createdAt: Date
  updatedAt: Date
}
