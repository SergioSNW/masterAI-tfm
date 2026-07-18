import { useState } from 'react'
import type { Casting, Round } from '../data/mock'

interface Props {
  casting: Casting
  onBack: () => void
  onRoundClick: (id: string) => void
  onRoundCreate: (castingId: string, round: Round) => void
}

export function CastingDetailView({ casting, onBack, onRoundClick, onRoundCreate }: Props) {
  const [showForm, setShowForm] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const newRound: Round = {
      id: `r${Date.now()}`,
      castingId: casting.id,
      name: form.get('name') as string,
      description: (form.get('description') as string) || undefined,
      deadline: (form.get('deadline') as string) || undefined,
      order: casting.rounds.length,
      status: 'pending',
      submissions: [],
    }
    onRoundCreate(casting.id, newRound)
    setShowForm(false)
  }

  return (
    <div className="animate-in">
      <button className="back-btn" onClick={onBack}>← Back to Project</button>

      <div className="detail-header">
        <div className="detail-header-left">
          <h1>{casting.roleName}</h1>
          <p>{casting.description}</p>
        </div>
        <div className="detail-header-right">
          <span className={`badge badge-${casting.status}`}>{casting.status}</span>
          {casting.status === 'open' && (
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ New Round</button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Round</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Name *</label>
                  <input name="name" required placeholder="e.g. Self-Tape Submission" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Description</label>
                  <textarea name="description" rows={3} placeholder="Describe the round..." style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Deadline</label>
                  <input name="deadline" type="date" style={inputStyle} />
                </div>
              </div>
              <div className="action-buttons">
                <button type="submit" className="btn btn-primary">Create Round</button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {casting.requirements && (
        <div className="glass" style={{ padding: 16, borderRadius: 'var(--radius-md)', marginBottom: 24, fontSize: 14 }}>
          <strong style={{ color: 'var(--text-secondary)' }}>Requirements:</strong>{' '}
          <span style={{ color: 'var(--text-secondary)' }}>{casting.requirements}</span>
        </div>
      )}

      <div className="card-grid">
        {casting.rounds.map((round, i) => (
          <div
            key={round.id}
            className={`card glass glass-hover animate-in animate-in-d${i + 1}`}
            onClick={() => onRoundClick(round.id)}
          >
            <span className={`badge badge-${round.status}`}>{round.status}</span>
            <h3 className="card-title" style={{ marginTop: 12 }}>{round.name}</h3>
            {round.description && <p className="card-sub">{round.description}</p>}
            <div className="card-meta">
              <span>{round.submissions.length} submissions</span>
              {round.deadline && <span>Due {new Date(round.deadline).toLocaleDateString()}</span>}
            </div>
          </div>
        ))}

        {casting.rounds.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <h3>No rounds yet</h3>
            <p>Create your first round to start accepting submissions.</p>
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
