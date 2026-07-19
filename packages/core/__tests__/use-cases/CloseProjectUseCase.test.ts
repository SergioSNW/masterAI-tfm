import { describe, it, expect, vi } from 'vitest'
import { CloseProjectUseCase } from '../../use-cases/projects/CloseProjectUseCase'
import type { IProjectRepository } from '../../repositories'
import type { Project } from '../../entities'

describe('CloseProjectUseCase', () => {
  it('closes an active project', async () => {
    const repo: IProjectRepository = {
      findById: vi.fn().mockResolvedValue({ id: 'p1', directorId: 'd1', title: 'Test', status: 'active', createdAt: new Date(), updatedAt: new Date() } as Project),
      findByDirectorId: vi.fn(),
      create: vi.fn(),
      update: vi.fn().mockImplementation(async (p: Project) => p),
      delete: vi.fn(),
    }

    const useCase = new CloseProjectUseCase(repo)
    const result = await useCase.execute({ projectId: 'p1', directorId: 'd1' })

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.status).toBe('closed')
  })

  it('rejects if project not found', async () => {
    const repo: IProjectRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByDirectorId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }

    const useCase = new CloseProjectUseCase(repo)
    const result = await useCase.execute({ projectId: 'missing', directorId: 'd1' })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toContain('Project not found')
  })

  it('rejects if not authorized', async () => {
    const repo: IProjectRepository = {
      findById: vi.fn().mockResolvedValue({ id: 'p1', directorId: 'd1', title: 'Test', status: 'active', createdAt: new Date(), updatedAt: new Date() } as Project),
      findByDirectorId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }

    const useCase = new CloseProjectUseCase(repo)
    const result = await useCase.execute({ projectId: 'p1', directorId: 'wrong' })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toContain('Not authorized')
  })

  it('rejects if already closed', async () => {
    const repo: IProjectRepository = {
      findById: vi.fn().mockResolvedValue({ id: 'p1', directorId: 'd1', title: 'Test', status: 'closed', createdAt: new Date(), updatedAt: new Date() } as Project),
      findByDirectorId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }

    const useCase = new CloseProjectUseCase(repo)
    const result = await useCase.execute({ projectId: 'p1', directorId: 'd1' })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toContain('already closed')
  })
})
