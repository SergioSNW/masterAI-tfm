import * as FileSystem from 'expo-file-system/legacy'
import { ActorDTO } from './types'

const PROFILE_FILE = `${FileSystem.documentDirectory}actor-profile.json`

const DEFAULT_PROFILE: ActorDTO = {
  id: 'local-actor-1',
  name: 'Alex Rivera',
  email: 'alex@example.com',
  phone: '+1 555 123 456',
}

let cachedProfile: ActorDTO | null = null

export async function loadProfile(): Promise<ActorDTO> {
  if (cachedProfile) return cachedProfile
  try {
    const info = await FileSystem.getInfoAsync(PROFILE_FILE)
    if (info.exists) {
      const raw = await FileSystem.readAsStringAsync(PROFILE_FILE)
      cachedProfile = JSON.parse(raw) as ActorDTO
      return cachedProfile!
    }
  } catch { /* fall through */ }
  cachedProfile = DEFAULT_PROFILE
  return cachedProfile
}

export async function saveProfile(profile: ActorDTO): Promise<void> {
  cachedProfile = profile
  await FileSystem.writeAsStringAsync(PROFILE_FILE, JSON.stringify(profile))
}
