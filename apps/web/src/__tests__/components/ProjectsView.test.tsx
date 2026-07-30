import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProjectProvider } from '../../context/ProjectContext'
import { ProjectsView } from '../../views/ProjectsView'
import * as projectService from '../../services/projectService'
import type { Project } from '../../data/mock'

vi.mock('../../services/projectService', () => ({
  createProject: vi.fn(),
  updateProjectStatus: vi.fn(),
}))

const mockProjects: Project[] = [
  { id: 'p1', title: 'Test Project', description: 'A test', status: 'active', castings: [] },
]

describe('ProjectsView - Status Badge Dropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(projectService.updateProjectStatus).mockResolvedValue({
      id: 'p1', title: 'Test Project', description: 'A test', status: 'closed', createdAt: '', updatedAt: '',
    })
  })

  it('renders the status badge with current status', () => {
    render(
      <ProjectProvider initial={mockProjects}>
        <ProjectsView projects={mockProjects} onProjectClick={vi.fn()} onProjectCreate={vi.fn()} />
      </ProjectProvider>
    )

    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('opens dropdown when status badge is clicked', async () => {
    const user = userEvent.setup()

    render(
      <ProjectProvider initial={mockProjects}>
        <ProjectsView projects={mockProjects} onProjectClick={vi.fn()} onProjectCreate={vi.fn()} />
      </ProjectProvider>
    )

    await user.click(screen.getByText('Open'))

    expect(screen.getByText('Draft')).toBeInTheDocument()
    expect(screen.getByText('Closed')).toBeInTheDocument()
  })

  it('calls updateProjectStatus when a new status is selected', async () => {
    vi.mocked(projectService.updateProjectStatus).mockResolvedValue({
      id: 'p1', title: 'Test Project', status: 'closed', createdAt: '', updatedAt: '',
    })
    const user = userEvent.setup()

    render(
      <ProjectProvider initial={mockProjects}>
        <ProjectsView projects={mockProjects} onProjectClick={vi.fn()} onProjectCreate={vi.fn()} />
      </ProjectProvider>
    )

    await user.click(screen.getByText('Open'))
    await user.click(screen.getByText('Closed'))

    expect(vi.mocked(projectService.updateProjectStatus)).toHaveBeenCalledWith('p1', 'closed')
  })
})
