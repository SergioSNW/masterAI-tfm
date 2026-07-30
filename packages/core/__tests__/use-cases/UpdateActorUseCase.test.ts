import { describe, it, expect, vi } from 'vitest'
import { UpdateActorUseCase } from '../../use-cases/actors/UpdateActorUseCase'
import type { IActorRepository } from '../../repositories'
import type { Actor } from '../../entities'

function existingActor(): Actor {
  return {
    id: 'a1',
    email: 'actor@test.com',
    name: 'Test Actor',
    phone: '+44 123 456',
    profilePictureUrl: 'https://example.com/old.jpg',
    bio: 'Old bio',
    agency: 'Old Agency',
    availability: 'Available',
    preferredRoles: 'Lead',
    castingStage: 'Pending',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  }
}

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

describe('UpdateActorUseCase', () => {
  it('updates an actor successfully', async () => {
    const repo = mockRepo({
      findById: vi.fn().mockResolvedValue(existingActor()),
      update: vi.fn().mockImplementation(async (a: Actor) => a),
    })

    const useCase = new UpdateActorUseCase(repo)
    const result = await useCase.execute({
      id: 'a1',
      name: 'Updated Name',
      email: 'updated@test.com',
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.name).toBe('Updated Name')
      expect(result.data.email).toBe('updated@test.com')
      expect(result.data.availability).toBe('Available')
      expect(result.data.castingStage).toBe('Pending')
    }
  })

  it('rejects update for non-existent actor', async () => {
    const repo = mockRepo({
      findById: vi.fn().mockResolvedValue(null),
    })

    const useCase = new UpdateActorUseCase(repo)
    const result = await useCase.execute({ id: 'missing', name: 'Ghost' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.message).toContain('not found')
    }
  })

  it('rejects duplicate email', async () => {
    const repo = mockRepo({
      findById: vi.fn().mockResolvedValue(existingActor()),
      findByEmail: vi.fn().mockResolvedValue({ id: 'a2', email: 'taken@test.com' } as Actor),
    })

    const useCase = new UpdateActorUseCase(repo)
    const result = await useCase.execute({ id: 'a1', email: 'taken@test.com' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.message).toContain('already exists')
    }
  })

  it('updates castingsStage and availability', async () => {
    const repo = mockRepo({
      findById: vi.fn().mockResolvedValue(existingActor()),
      update: vi.fn().mockImplementation(async (a: Actor) => a),
    })

    const useCase = new UpdateActorUseCase(repo)
    const result = await useCase.execute({
      id: 'a1',
      castingStage: 'Callback',
      availability: 'Limited',
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.castingStage).toBe('Callback')
      expect(result.data.availability).toBe('Limited')
    }
  })
})
