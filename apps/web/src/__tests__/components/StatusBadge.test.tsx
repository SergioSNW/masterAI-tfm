import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProjectProvider, useProjectContext } from '../../context/ProjectContext'
import * as projectService from '../../services/projectService'
import type { Project } from '../../data/mock'

vi.mock('../../services/projectService', () => ({
  createProject: vi.fn(),
  updateProjectStatus: vi.fn(),
}))

const mockProjects: Project[] = [
  { id: 'p1', title: 'Project A', description: 'Desc A', status: 'active', castings: [] },
  { id: 'p2', title: 'Project B', description: 'Desc B', status: 'draft', castings: [] },
]

function ProjectStatusTest() {
  const { projects, updateStatus } = useProjectContext()
  return (
    <div>
      {projects.map(p => (
        <div key={p.id} data-testid={`project-${p.id}`}>
          <span data-testid={`status-${p.id}`}>{p.status}</span>
          <button data-testid={`toggle-${p.id}`} onClick={() => updateStatus(p.id, p.status === 'active' ? 'closed' : 'active')}>
            Toggle
          </button>
        </div>
      ))}
    </div>
  )
}

describe('ProjectContext - Status Update', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('optimistically updates status on toggle', async () => {
    vi.mocked(projectService.updateProjectStatus).mockResolvedValue({
      id: 'p1', title: 'Project A', description: 'Desc A', status: 'closed', createdAt: '', updatedAt: '',
    })
    const user = userEvent.setup()

    render(
      <ProjectProvider initial={mockProjects}>
        <ProjectStatusTest />
      </ProjectProvider>
    )

    expect(screen.getByTestId('status-p1')).toHaveTextContent('active')
    await user.click(screen.getByTestId('toggle-p1'))
    expect(screen.getByTestId('status-p1')).toHaveTextContent('closed')
  })

  it('reverts status on API failure', async () => {
    vi.mocked(projectService.updateProjectStatus).mockRejectedValue(new Error('Network error'))
    const user = userEvent.setup()

    render(
      <ProjectProvider initial={mockProjects}>
        <ProjectStatusTest />
      </ProjectProvider>
    )

    expect(screen.getByTestId('status-p1')).toHaveTextContent('active')
    await user.click(screen.getByTestId('toggle-p1'))
    expect(screen.getByTestId('status-p1')).toHaveTextContent('active')
  })

  it('calls updateProjectStatus with correct URL and payload', async () => {
    vi.mocked(projectService.updateProjectStatus).mockResolvedValue({
      id: 'p1', title: 'Project A', description: 'Desc A', status: 'closed', createdAt: '', updatedAt: '',
    })
    const user = userEvent.setup()

    render(
      <ProjectProvider initial={mockProjects}>
        <ProjectStatusTest />
      </ProjectProvider>
    )

    await user.click(screen.getByTestId('toggle-p1'))

    expect(vi.mocked(projectService.updateProjectStatus)).toHaveBeenCalledWith('p1', 'closed')
  })
})
