import { describe, it, expect, vi } from 'vitest'
import { UpdateCastingPhaseUseCase } from '../../use-cases/castings/UpdateCastingPhaseUseCase'
import type { ICastingRepository } from '../../repositories'
import type { Casting } from '../../entities'

function existingCasting(): Casting {
  return {
    id: 'c1',
    projectId: 'p1',
    roleName: 'Lead Role',
    description: 'Main character',
    requirements: 'British accent',
    status: 'open',
    activePhase: 'First Round',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  }
}

function mockRepo(overrides?: Partial<ICastingRepository>): ICastingRepository {
  return {
    findById: vi.fn(),
    findByProjectId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  }
}

describe('UpdateCastingPhaseUseCase', () => {
  it('updates activePhase to Callback', async () => {
    const repo = mockRepo({
      findById: vi.fn().mockResolvedValue(existingCasting()),
      update: vi.fn().mockImplementation(async (c: Casting) => c),
    })

    const useCase = new UpdateCastingPhaseUseCase(repo)
    const result = await useCase.execute({ castingId: 'c1', activePhase: 'Callback' })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.activePhase).toBe('Callback')
    }
  })

  it('updates activePhase to Closed', async () => {
    const repo = mockRepo({
      findById: vi.fn().mockResolvedValue(existingCasting()),
      update: vi.fn().mockImplementation(async (c: Casting) => c),
    })

    const useCase = new UpdateCastingPhaseUseCase(repo)
    const result = await useCase.execute({ castingId: 'c1', activePhase: 'Closed' })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.activePhase).toBe('Closed')
    }
  })

  it('rejects update for non-existent casting', async () => {
    const repo = mockRepo({
      findById: vi.fn().mockResolvedValue(null),
    })

    const useCase = new UpdateCastingPhaseUseCase(repo)
    const result = await useCase.execute({ castingId: 'missing', activePhase: 'Callback' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.message).toContain('not found')
    }
  })
})
