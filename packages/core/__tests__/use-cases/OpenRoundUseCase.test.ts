import { describe, it, expect, vi } from 'vitest'
import { OpenRoundUseCase } from '../../use-cases/rounds/OpenRoundUseCase'
import type { IRoundRepository } from '../../repositories'
import type { Round } from '../../entities'

describe('OpenRoundUseCase', () => {
  it('opens a pending round', async () => {
    const repo: IRoundRepository = {
      findById: vi.fn().mockResolvedValue({ id: 'r1', castingId: 'c1', name: 'Self-Tape', order: 0, status: 'pending', createdAt: new Date(), updatedAt: new Date() } as Round),
      findByCastingId: vi.fn(),
      create: vi.fn(),
      update: vi.fn().mockImplementation(async (r: Round) => r),
      delete: vi.fn(),
    }

    const useCase = new OpenRoundUseCase(repo)
    const result = await useCase.execute({ roundId: 'r1' })

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.status).toBe('open')
  })

  it('rejects if round is not pending', async () => {
    const repo: IRoundRepository = {
      findById: vi.fn().mockResolvedValue({ id: 'r1', castingId: 'c1', name: 'Self-Tape', order: 0, status: 'open', createdAt: new Date(), updatedAt: new Date() } as Round),
      findByCastingId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }

    const useCase = new OpenRoundUseCase(repo)
    const result = await useCase.execute({ roundId: 'r1' })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toContain('pending')
  })

  it('rejects if round not found', async () => {
    const repo: IRoundRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByCastingId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }

    const useCase = new OpenRoundUseCase(repo)
    const result = await useCase.execute({ roundId: 'missing' })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toContain('Round not found')
  })
})
