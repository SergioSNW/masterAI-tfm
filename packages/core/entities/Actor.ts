export interface Actor {
  id: string
  email: string
  name: string
  profilePictureUrl?: string
  phone?: string
  bio?: string
  createdAt: Date
  updatedAt: Date
}
