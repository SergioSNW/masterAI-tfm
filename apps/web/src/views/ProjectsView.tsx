import { useState } from 'react'
import type { Project } from '../data/mock'
import { CreateProjectModal } from '../components/CreateProjectModal'
import type { CreateProjectInput } from '../services/projectService'

interface Props {
  projects: Project[]
  onProjectClick: (id: string) => void
  onProjectCreate: (data: CreateProjectInput) => Promise<void>
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
            <span className={`badge badge-${project.status}`}>{project.status}</span>
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
