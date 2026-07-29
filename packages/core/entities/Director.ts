export interface Director {
  id: string
  email: string
  name: string
  profilePictureUrl?: string
  company?: string
  phone?: string
  bio?: string
  createdAt: Date
  updatedAt: Date
}
