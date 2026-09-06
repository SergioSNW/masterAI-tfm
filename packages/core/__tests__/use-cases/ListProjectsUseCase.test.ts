import { describe, it, expect, vi } from 'vitest'
import { ListProjectsUseCase } from '../../use-cases/projects/ListProjectsUseCase.js'
import type { IProjectRepository } from '../../repositories/index.js'
import type { Project } from '../../entities/index.js'

function mockRepo(overrides?: Partial<IProjectRepository>): IProjectRepository {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByDirectorId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  }
}

const project: Project = {
  id: 'p1',
  directorId: 'd1',
  title: 'The Crown — Season 3',
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('ListProjectsUseCase', () => {
  it('returns all projects from the repository', async () => {
    const repo = mockRepo({ findAll: vi.fn().mockResolvedValue([project]) })

    const useCase = new ListProjectsUseCase(repo)
    const result = await useCase.execute()

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data).toEqual([project])
    expect(repo.findAll).toHaveBeenCalledTimes(1)
  })

  it('returns an empty array when there are no projects', async () => {
    const repo = mockRepo({ findAll: vi.fn().mockResolvedValue([]) })

    const useCase = new ListProjectsUseCase(repo)
    const result = await useCase.execute()

    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data).toEqual([])
  })
})
