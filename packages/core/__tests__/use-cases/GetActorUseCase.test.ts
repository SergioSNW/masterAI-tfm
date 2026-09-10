import { describe, it, expect, vi } from 'vitest'
import { GetActorUseCase } from '../../use-cases/actors/GetActorUseCase.js'
import type { IActorRepository } from '../../repositories/index.js'
import type { Actor } from '../../entities/index.js'

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

const actor: Actor = {
  id: 'a1',
  email: 'a1@example.com',
  name: 'Actor One',
  availability: 'Available',
  castingStage: 'Pending',
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('GetActorUseCase', () => {
  it('returns the actor when found', async () => {
    const repo = mockRepo({ findById: vi.fn().mockResolvedValue(actor) })

    const useCase = new GetActorUseCase(repo)
    const result = await useCase.execute('a1')

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data).toEqual(actor)
    expect(repo.findById).toHaveBeenCalledWith('a1')
  })

  it('rejects when the actor does not exist', async () => {
    const repo = mockRepo({ findById: vi.fn().mockResolvedValue(null) })

    const useCase = new GetActorUseCase(repo)
    const result = await useCase.execute('missing')

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toBe('Actor not found')
  })
})
