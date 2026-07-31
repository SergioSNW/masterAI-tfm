import { describe, it, expect, vi } from 'vitest'
import { UpdateProjectStatusUseCase } from '../../use-cases/projects/UpdateProjectStatusUseCase.js'
import type { IProjectRepository } from '../../repositories/index.js'
import type { Project } from '../../entities/index.js'

function existingProject(): Project {
  return {
    id: 'p1',
    directorId: 'd1',
    title: 'Test Project',
    description: 'A test project',
    status: 'active',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  }
}

function mockRepo(overrides?: Partial<IProjectRepository>): IProjectRepository {
  return {
    findById: vi.fn(),
    findAll: vi.fn(),
    findByDirectorId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  }
}

describe('UpdateProjectStatusUseCase', () => {
  it('updates status to closed', async () => {
    const repo = mockRepo({
      findById: vi.fn().mockResolvedValue(existingProject()),
      update: vi.fn().mockImplementation(async (p: Project) => p),
    })

    const useCase = new UpdateProjectStatusUseCase(repo)
    const result = await useCase.execute({ projectId: 'p1', status: 'closed' })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.status).toBe('closed')
    }
  })

  it('updates status to draft', async () => {
    const repo = mockRepo({
      findById: vi.fn().mockResolvedValue(existingProject()),
      update: vi.fn().mockImplementation(async (p: Project) => p),
    })

    const useCase = new UpdateProjectStatusUseCase(repo)
    const result = await useCase.execute({ projectId: 'p1', status: 'draft' })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.status).toBe('draft')
    }
  })

  it('rejects update for non-existent project', async () => {
    const repo = mockRepo({
      findById: vi.fn().mockResolvedValue(null),
    })

    const useCase = new UpdateProjectStatusUseCase(repo)
    const result = await useCase.execute({ projectId: 'missing', status: 'closed' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.message).toContain('not found')
    }
  })
})
