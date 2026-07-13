import type { Project } from '../data/mock'

interface Props {
  project: Project
  onBack: () => void
  onCastingClick: (id: string) => void
}

export function ProjectDetailView({ project, onBack, onCastingClick }: Props) {
  return (
    <div className="animate-in">
      <button className="back-btn" onClick={onBack}>← Back to Projects</button>

      <div className="detail-header">
        <div className="detail-header-left">
          <h1>{project.title}</h1>
          <p>{project.description}</p>
        </div>
        <div className="detail-header-right">
          <span className={`badge badge-${project.status}`}>{project.status}</span>
          <button className="btn btn-primary">+ New Casting</button>
        </div>
      </div>

      <div className="card-grid">
        {project.castings.map((casting, i) => (
          <div
            key={casting.id}
            className={`card glass glass-hover animate-in animate-in-d${i + 1}`}
            onClick={() => onCastingClick(casting.id)}
          >
            <span className={`badge badge-${casting.status}`}>{casting.status}</span>
            <h3 className="card-title" style={{ marginTop: 12 }}>{casting.roleName}</h3>
            <p className="card-sub">{casting.description}</p>
            <div className="card-meta">
              <span>{casting.rounds.length} rounds</span>
              {casting.requirements && <span>{casting.requirements}</span>}
            </div>
          </div>
        ))}

        {project.castings.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <h3>No castings yet</h3>
            <p>Create your first casting role to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}
