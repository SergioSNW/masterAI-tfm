import { describe, it, expect, vi } from 'vitest'
import { ListActorsUseCase } from '../../use-cases/actors/ListActorsUseCase.js'
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

describe('ListActorsUseCase', () => {
  it('returns all actors when no search term is given', async () => {
    const repo = mockRepo({ findMany: vi.fn().mockResolvedValue([actor]) })

    const useCase = new ListActorsUseCase(repo)
    const result = await useCase.execute({})

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data).toEqual([actor])
    expect(repo.findMany).toHaveBeenCalledWith(undefined)
  })

  it('forwards the search term to the repository', async () => {
    const repo = mockRepo({ findMany: vi.fn().mockResolvedValue([actor]) })

    const useCase = new ListActorsUseCase(repo)
    await useCase.execute({ search: 'One' })

    expect(repo.findMany).toHaveBeenCalledWith('One')
  })

  it('returns an empty array when nothing matches', async () => {
    const repo = mockRepo({ findMany: vi.fn().mockResolvedValue([]) })

    const useCase = new ListActorsUseCase(repo)
    const result = await useCase.execute({ search: 'nobody' })

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data).toEqual([])
  })
})
