import { useState } from 'react'
import type { Project, Casting } from '../data/mock'

interface Props {
  project: Project
  onBack: () => void
  onCastingClick: (id: string) => void
  onCastingCreate: (projectId: string, casting: Casting) => void
}

export function ProjectDetailView({ project, onBack, onCastingClick, onCastingCreate }: Props) {
  const [showForm, setShowForm] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const newCasting: Casting = {
      id: `c${Date.now()}`,
      projectId: project.id,
      roleName: form.get('roleName') as string,
      description: (form.get('description') as string) || undefined,
      requirements: (form.get('requirements') as string) || undefined,
      status: 'open',
      rounds: [],
    }
    onCastingCreate(project.id, newCasting)
    setShowForm(false)
  }

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
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ New Casting</button>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Casting</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Role Name *</label>
                  <input name="roleName" required placeholder="e.g. Lead Role — Lady Victoria" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Description</label>
                  <textarea name="description" rows={3} placeholder="Describe the role..." style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Requirements</label>
                  <textarea name="requirements" rows={2} placeholder="e.g. British accent, age 30-45" style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
              </div>
              <div className="action-buttons">
                <button type="submit" className="btn btn-primary">Create Casting</button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

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

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--glass-bg)',
  border: '1px solid var(--glass-border)',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font)',
  fontSize: 14,
  outline: 'none',
}
