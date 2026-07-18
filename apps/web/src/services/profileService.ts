export interface Profile {
  name: string
  email: string
}

const STORAGE_KEY = 'masterai-director-profile'
const DEFAULT: Profile = { name: 'Sarah Connor', email: 'sarah.connor@example.com' }

export function getProfile(): Profile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Profile
  } catch { /* fall through */ }
  return DEFAULT
}

export function saveProfile(profile: Profile): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}
