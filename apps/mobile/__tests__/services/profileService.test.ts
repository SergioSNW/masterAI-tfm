import { loadProfile, saveProfile } from '../../src/services/profileService'

jest.mock('expo-file-system', () => ({
  FileSystem: {
    documentDirectory: '/mock-docs/',
  },
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  readAsStringAsync: jest.fn(() => Promise.resolve('')),
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: false })),
}))

describe('profileService', () => {
  it('loadProfile returns default profile when no file exists', async () => {
    const profile = await loadProfile()
    expect(profile).toHaveProperty('name')
    expect(profile).toHaveProperty('email')
    expect(profile.name).toBe('Alex Rivera')
    expect(profile.email).toBe('alex@example.com')
  })

  it('saveProfile stores the profile object', async () => {
    const updated = {
      id: 'local-1',
      name: 'Jane Doe',
      email: 'jane@test.com',
      phone: '+1 555 999 000',
    }
    await expect(saveProfile(updated)).resolves.toBeUndefined()
  })
})
