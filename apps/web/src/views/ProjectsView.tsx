import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { Project } from '../data/mock'
import { CreateProjectModal } from '../components/CreateProjectModal'
import type { CreateProjectInput } from '../services/projectService'
import { useProjectContext } from '../context/ProjectContext'

interface Props {
  projects: Project[]
  onProjectClick: (id: string) => void
  onProjectCreate: (data: CreateProjectInput) => Promise<void>
}

const STATUS_OPTIONS: Array<{ value: Project['status']; label: string }> = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Open' },
  { value: 'closed', label: 'Closed' },
]

function StatusBadge({ project }: { project: Project }) {
  const { updateStatus } = useProjectContext()
  const [open, setOpen] = useState(false)

  const dotClass: Record<Project['status'], string> = {
    draft: 'stage-pending',
    active: 'stage-first-round',
    closed: 'stage-casted',
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} onClick={e => e.stopPropagation()}>
      <button
        className={`status-badge status-${project.status}`}
        onClick={() => setOpen(!open)}
      >
        {project.status === 'active' ? 'Open' : project.status.charAt(0).toUpperCase() + project.status.slice(1)}
        <ChevronDown size={12} />
      </button>
      {open && (
        <div
          className="action-menu-dropdown"
          style={{ top: '100%', left: 0, marginTop: 4, minWidth: 120 }}
        >
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className="action-menu-item"
              onClick={() => {
                updateStatus(project.id, opt.value)
                setOpen(false)
              }}
            >
              {opt.value === project.status && (
                <span className={`stage-dot ${dotClass[opt.value]}`} />
              )}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function ProjectsView({ projects, onProjectClick, onProjectCreate }: Props) {
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div>
      <div className="detail-header">
        <div className="detail-header-left">
          <h1>Projects</h1>
          <p>{projects.length} casting projects</p>
        </div>
        <div className="detail-header-right">
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Project</button>
        </div>
      </div>

      {showCreate && (
        <CreateProjectModal
          onSubmit={async (data) => {
            await onProjectCreate(data)
            setShowCreate(false)
          }}
          onClose={() => setShowCreate(false)}
        />
      )}

      <div className="card-grid">
        {projects.map((project, i) => (
          <div
            key={project.id}
            className={`card glass glass-hover animate-in animate-in-d${i + 1}`}
            onClick={() => onProjectClick(project.id)}
          >
            <StatusBadge project={project} />
            <h3 className="card-title" style={{ marginTop: 12 }}>{project.title}</h3>
            <p className="card-sub">{project.description}</p>
            <div className="card-meta">
              <span>{project.castings.length} castings</span>
              <span>{project.castings.reduce((s, c) => s + c.rounds.length, 0)} rounds</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
