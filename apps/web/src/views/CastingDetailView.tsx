import type { Casting } from '../data/mock'

interface Props {
  casting: Casting
  onBack: () => void
  onRoundClick: (id: string) => void
}

export function CastingDetailView({ casting, onBack, onRoundClick }: Props) {
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
          <button className="btn btn-primary">+ New Round</button>
        </div>
      </div>

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
      </div>
    </div>
  )
}
