import { describe, it, expect, vi } from 'vitest'
import { CreateActorUseCase } from '../../use-cases/actors/CreateActorUseCase'
import type { IActorRepository } from '../../repositories'
import type { Actor } from '../../entities'

function mockRepo(overrides?: Partial<IActorRepository>): IActorRepository {
  return {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  }
}

describe('CreateActorUseCase', () => {
  it('creates an actor successfully', async () => {
    const repo = mockRepo({
      findByEmail: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(async (a: Actor) => a),
    })

    const useCase = new CreateActorUseCase(repo)
    const result = await useCase.execute({
      email: 'test@example.com',
      name: 'Test Actor',
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.email).toBe('test@example.com')
      expect(result.data.name).toBe('Test Actor')
    }
  })

  it('rejects duplicate email', async () => {
    const repo = mockRepo({
      findByEmail: vi.fn().mockResolvedValue({ id: 'existing', email: 'dup@example.com', name: 'Existing' } as Actor),
    })

    const useCase = new CreateActorUseCase(repo)
    const result = await useCase.execute({
      email: 'dup@example.com',
      name: 'Another',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.message).toContain('already exists')
    }
  })

  it('accepts optional fields', async () => {
    const repo = mockRepo({
      findByEmail: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(async (a: Actor) => a),
    })

    const useCase = new CreateActorUseCase(repo)
    const result = await useCase.execute({
      email: 'full@example.com',
      name: 'Full Actor',
      phone: '+44 123 456',
      profilePictureUrl: 'https://example.com/photo.jpg',
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.phone).toBe('+44 123 456')
      expect(result.data.profilePictureUrl).toBe('https://example.com/photo.jpg')
    }
  })
})
