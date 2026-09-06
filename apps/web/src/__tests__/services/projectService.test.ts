import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as api from '../../services/api'
import { createProject, updateProjectStatus, fetchDashboard } from '../../services/projectService'

vi.mock('../../services/api', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
}))

describe('projectService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('createProject injects the demo directorId', async () => {
    vi.mocked(api.post).mockResolvedValue({ id: 'p1' })

    await createProject({ title: 'The Crown — Season 4' })

    expect(api.post).toHaveBeenCalledWith('/projects/create', { title: 'The Crown — Season 4', directorId: 'd1' })
  })

  it('updateProjectStatus PUTs to the project status endpoint', async () => {
    vi.mocked(api.put).mockResolvedValue({ id: 'p1', status: 'closed' })

    await updateProjectStatus('p1', 'closed')

    expect(api.put).toHaveBeenCalledWith('/projects/p1/status', { status: 'closed' })
  })

  it('fetchDashboard flattens the nested project tree into the UI shape', async () => {
    vi.mocked(api.get).mockResolvedValue([
      {
        id: 'p1',
        title: 'The Crown — Season 3',
        status: 'active',
        castings: [
          {
            id: 'c1',
            projectId: 'p1',
            roleName: 'Lady Victoria',
            status: 'open',
            rounds: [
              {
                id: 'r1',
                castingId: 'c1',
                name: 'Self-Tape Submission',
                order: 0,
                status: 'open',
                submissions: [
                  {
                    id: 's1',
                    actorId: 'a1',
                    actorName: 'Emma Richardson',
                    actorEmail: 'emma.r@example.com',
                    videoUrl: 'https://cdn/video.mp4',
                    status: 'pending',
                    createdAt: '2026-09-01T00:00:00.000Z',
                  },
                ],
              },
            ],
          },
        ],
      },
    ])

    const [project] = await fetchDashboard()

    expect(project.id).toBe('p1')
    expect(project.castings[0].roleName).toBe('Lady Victoria')
    const submission = project.castings[0].rounds[0].submissions[0]
    expect(submission.actorName).toBe('Emma Richardson')
    expect(submission.avatarColor).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('fetchDashboard assigns the same avatar color to the same actor across submissions', async () => {
    const submissionFor = (id: string) => ({
      id, actorId: 'a1', actorName: 'Emma Richardson', actorEmail: 'emma.r@example.com',
      videoUrl: 'https://cdn/video.mp4', status: 'pending', createdAt: '2026-09-01T00:00:00.000Z',
    })
    vi.mocked(api.get).mockResolvedValue([
      {
        id: 'p1', title: 'P', status: 'active',
        castings: [
          { id: 'c1', projectId: 'p1', roleName: 'R1', status: 'open', rounds: [{ id: 'r1', castingId: 'c1', name: 'Round', order: 0, status: 'open', submissions: [submissionFor('s1')] }] },
          { id: 'c2', projectId: 'p1', roleName: 'R2', status: 'open', rounds: [{ id: 'r2', castingId: 'c2', name: 'Round', order: 0, status: 'open', submissions: [submissionFor('s2')] }] },
        ],
      },
    ])

    const [project] = await fetchDashboard()

    const color1 = project.castings[0].rounds[0].submissions[0].avatarColor
    const color2 = project.castings[1].rounds[0].submissions[0].avatarColor
    expect(color1).toBe(color2)
  })
})
