import type { Casting } from '../../entities'
import type { ICastingRepository, IProjectRepository } from '../../repositories'
import type { Result } from '../types'

export interface CreateCastingDTO {
  projectId: string
  roleName: string
  description?: string
  requirements?: string
}

export class CreateCastingUseCase {
  constructor(
    private readonly castingRepo: ICastingRepository,
    private readonly projectRepo: IProjectRepository,
  ) {}

  async execute(dto: CreateCastingDTO): Promise<Result<Casting>> {
    const project = await this.projectRepo.findById(dto.projectId)
    if (!project) {
      return { ok: false, error: new Error('Project not found') }
    }

    if (project.status !== 'active') {
      return { ok: false, error: new Error('Project must be active to create castings') }
    }

    const casting: Casting = {
      id: crypto.randomUUID(),
      projectId: dto.projectId,
      roleName: dto.roleName,
      description: dto.description,
      requirements: dto.requirements,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const created = await this.castingRepo.create(casting)
    return { ok: true, data: created }
  }
}
