import { describe, it, expect, beforeEach } from 'vitest'
import { getProfile, saveProfile } from '../../services/profileService'

describe('profileService', () => {
  beforeEach(() => localStorage.clear())

  it('returns the default profile when nothing is stored', () => {
    const profile = getProfile()
    expect(profile.name).toBe('Sarah Connor')
    expect(profile.email).toBe('sarah.connor@example.com')
  })

  it('persists and reloads a saved profile', () => {
    saveProfile({ name: 'Demo Director', email: 'director@masterai.demo', company: 'MasterAI Studio' })

    const profile = getProfile()

    expect(profile).toEqual({ name: 'Demo Director', email: 'director@masterai.demo', company: 'MasterAI Studio' })
  })

  it('falls back to the default profile when stored data is corrupted', () => {
    localStorage.setItem('masterai-director-profile', '{not valid json')

    const profile = getProfile()

    expect(profile.name).toBe('Sarah Connor')
  })
})
