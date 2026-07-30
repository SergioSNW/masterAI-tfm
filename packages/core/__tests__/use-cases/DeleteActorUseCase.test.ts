import { describe, it, expect, vi } from 'vitest'
import { DeleteActorUseCase } from '../../use-cases/actors/DeleteActorUseCase'
import type { IActorRepository } from '../../repositories'

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

describe('DeleteActorUseCase', () => {
  it('deletes an existing actor', async () => {
    const repo = mockRepo({
      findById: vi.fn().mockResolvedValue({ id: 'a1' }),
      delete: vi.fn().mockResolvedValue(undefined),
    })

    const useCase = new DeleteActorUseCase(repo)
    const result = await useCase.execute('a1')

    expect(result.ok).toBe(true)
    expect(repo.delete).toHaveBeenCalledWith('a1')
  })

  it('rejects delete for non-existent actor', async () => {
    const repo = mockRepo({
      findById: vi.fn().mockResolvedValue(null),
    })

    const useCase = new DeleteActorUseCase(repo)
    const result = await useCase.execute('missing')

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.message).toContain('not found')
    }
    expect(repo.delete).not.toHaveBeenCalled()
  })
})
