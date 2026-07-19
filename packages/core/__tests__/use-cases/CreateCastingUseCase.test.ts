import { describe, it, expect, vi } from 'vitest'
import { CreateCastingUseCase } from '../../use-cases/castings/CreateCastingUseCase'
import type { ICastingRepository, IProjectRepository } from '../../repositories'
import type { Casting, Project } from '../../entities'

function mockRepos() {
  return {
    castingRepo: {
      findById: vi.fn(),
      findByProjectId: vi.fn(),
      create: vi.fn().mockImplementation(async (c: Casting) => c),
      update: vi.fn(),
      delete: vi.fn(),
    } as ICastingRepository,
    projectRepo: {
      findById: vi.fn(),
      findByDirectorId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as IProjectRepository,
  }
}

function activeProject(): Project {
  return { id: 'p1', directorId: 'd1', title: 'Test', status: 'active', createdAt: new Date(), updatedAt: new Date() }
}

describe('CreateCastingUseCase', () => {
  it('creates a casting as open', async () => {
    const repos = mockRepos()
    repos.projectRepo.findById = vi.fn().mockResolvedValue(activeProject())

    const useCase = new CreateCastingUseCase(repos.castingRepo, repos.projectRepo)
    const result = await useCase.execute({ projectId: 'p1', roleName: 'Lead', description: 'Main role', requirements: 'Expressive' })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.roleName).toBe('Lead')
      expect(result.data.status).toBe('open')
      expect(result.data.description).toBe('Main role')
      expect(result.data.requirements).toBe('Expressive')
    }
  })

  it('rejects if project not found', async () => {
    const repos = mockRepos()
    repos.projectRepo.findById = vi.fn().mockResolvedValue(null)

    const useCase = new CreateCastingUseCase(repos.castingRepo, repos.projectRepo)
    const result = await useCase.execute({ projectId: 'missing', roleName: 'Lead' })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toContain('Project not found')
  })

  it('rejects if project is not active', async () => {
    const repos = mockRepos()
    repos.projectRepo.findById = vi.fn().mockResolvedValue({ ...activeProject(), status: 'draft' })

    const useCase = new CreateCastingUseCase(repos.castingRepo, repos.projectRepo)
    const result = await useCase.execute({ projectId: 'p1', roleName: 'Lead' })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.message).toContain('active')
  })
})
