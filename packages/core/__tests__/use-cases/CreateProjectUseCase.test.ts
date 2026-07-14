import { describe, it, expect, vi } from 'vitest'
import { CreateProjectUseCase } from '../../use-cases/projects/CreateProjectUseCase'
import type { IProjectRepository, IDirectorRepository } from '../../repositories'
import type { Director, Project } from '../../entities'

function mockRepos() {
  return {
    projectRepo: {
      findById: vi.fn(),
      findByDirectorId: vi.fn(),
      create: vi.fn().mockImplementation(async (p: Project) => p),
      update: vi.fn(),
      delete: vi.fn(),
    } as IProjectRepository,
    directorRepo: {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as IDirectorRepository,
  }
}

describe('CreateProjectUseCase', () => {
  it('creates a project as draft', async () => {
    const repos = mockRepos()
    repos.directorRepo.findById = vi.fn().mockResolvedValue({ id: 'd1', email: 'dir@test.com', name: 'Director' } as Director)

    const useCase = new CreateProjectUseCase(repos.projectRepo, repos.directorRepo)
    const result = await useCase.execute({ directorId: 'd1', title: 'New Project', description: 'A test' })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.title).toBe('New Project')
      expect(result.data.status).toBe('draft')
    }
  })

  it('rejects if director not found', async () => {
    const repos = mockRepos()
    repos.directorRepo.findById = vi.fn().mockResolvedValue(null)

    const useCase = new CreateProjectUseCase(repos.projectRepo, repos.directorRepo)
    const result = await useCase.execute({ directorId: 'missing', title: 'No Director' })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toContain('Director not found')
  })
})
