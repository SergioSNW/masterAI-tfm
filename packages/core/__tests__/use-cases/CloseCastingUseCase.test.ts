import { describe, it, expect, vi } from 'vitest'
import { CloseCastingUseCase } from '../../use-cases/castings/CloseCastingUseCase'
import type { ICastingRepository } from '../../repositories'
import type { Casting } from '../../entities'

describe('CloseCastingUseCase', () => {
  it('closes an open casting', async () => {
    const repo: ICastingRepository = {
      findById: vi.fn().mockResolvedValue({ id: 'c1', projectId: 'p1', roleName: 'Lead', status: 'open', createdAt: new Date(), updatedAt: new Date() } as Casting),
      findByProjectId: vi.fn(),
      create: vi.fn(),
      update: vi.fn().mockImplementation(async (c: Casting) => c),
      delete: vi.fn(),
    }

    const useCase = new CloseCastingUseCase(repo)
    const result = await useCase.execute({ castingId: 'c1' })

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.status).toBe('closed')
  })

  it('rejects if casting not found', async () => {
    const repo: ICastingRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByProjectId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }

    const useCase = new CloseCastingUseCase(repo)
    const result = await useCase.execute({ castingId: 'missing' })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toContain('Casting not found')
  })

  it('rejects if already closed', async () => {
    const repo: ICastingRepository = {
      findById: vi.fn().mockResolvedValue({ id: 'c1', projectId: 'p1', roleName: 'Lead', status: 'closed', createdAt: new Date(), updatedAt: new Date() } as Casting),
      findByProjectId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }

    const useCase = new CloseCastingUseCase(repo)
    const result = await useCase.execute({ castingId: 'c1' })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toContain('already closed')
  })
})
