import { describe, it, expect, vi } from 'vitest'
import { CreateRoundUseCase } from '../../use-cases/rounds/CreateRoundUseCase'
import type { IRoundRepository, ICastingRepository } from '../../repositories'
import type { Round, Casting } from '../../entities'

function mockRepos() {
  return {
    roundRepo: {
      findById: vi.fn(),
      findByCastingId: vi.fn(),
      create: vi.fn().mockImplementation(async (r: Round) => r),
      update: vi.fn(),
      delete: vi.fn(),
    } as IRoundRepository,
    castingRepo: {
      findById: vi.fn(),
      findByProjectId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as ICastingRepository,
  }
}

function openCasting(): Casting {
  return { id: 'c1', projectId: 'p1', roleName: 'Lead', status: 'open', createdAt: new Date(), updatedAt: new Date() }
}

describe('CreateRoundUseCase', () => {
  it('creates a round as pending', async () => {
    const repos = mockRepos()
    repos.castingRepo.findById = vi.fn().mockResolvedValue(openCasting())

    const useCase = new CreateRoundUseCase(repos.roundRepo, repos.castingRepo)
    const result = await useCase.execute({ castingId: 'c1', name: 'Self-Tape', order: 0, deadline: new Date('2026-08-15') })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.name).toBe('Self-Tape')
      expect(result.data.status).toBe('pending')
      expect(result.data.order).toBe(0)
    }
  })

  it('rejects if casting not found', async () => {
    const repos = mockRepos()
    repos.castingRepo.findById = vi.fn().mockResolvedValue(null)

    const useCase = new CreateRoundUseCase(repos.roundRepo, repos.castingRepo)
    const result = await useCase.execute({ castingId: 'missing', name: 'Round', order: 0 })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toContain('Casting not found')
  })

  it('rejects if casting is not open', async () => {
    const repos = mockRepos()
    repos.castingRepo.findById = vi.fn().mockResolvedValue({ ...openCasting(), status: 'closed' })

    const useCase = new CreateRoundUseCase(repos.roundRepo, repos.castingRepo)
    const result = await useCase.execute({ castingId: 'c1', name: 'Round', order: 0 })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toContain('open')
  })
})
