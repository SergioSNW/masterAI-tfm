import { useState, useEffect } from 'react'
import { fetchOpenCastings } from '../services/castingService'
import type { OpenCastingDTO } from '../services/castingService'
import { UploadVideoModal } from '../components/UploadVideoModal'

const ACTOR_ID = import.meta.env.VITE_ACTOR_ID ?? 'a1'

const STATUS_META: Record<string, { label: string; className: string }> = {
  shortlisted: { label: 'Shortlisted', className: 'badge-active' },
  reviewed: { label: 'Reviewed', className: 'badge-open' },
  rejected: { label: 'Rejected', className: 'badge-closed' },
  pending: { label: 'Pending Review', className: 'badge-pending' },
}

export function ActorPortalView() {
  const [castings, setCastings] = useState<OpenCastingDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<OpenCastingDTO | null>(null)
  const [showUpload, setShowUpload] = useState(false)

  const load = () => {
    setLoading(true)
    setError(null)
    fetchOpenCastings(ACTOR_ID)
      .then(setCastings)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load castings')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function handleUploadSuccess() {
    setShowUpload(false)
    load()
  }

  return (
    <div className="animate-in">
      <div className="detail-header">
        <div className="detail-header-left">
          <h1>Open Castings</h1>
          <p>Roles currently accepting auditions</p>
        </div>
      </div>

      {loading && (
        <div className="empty-state">
          <h3>Loading castings...</h3>
        </div>
      )}

      {!loading && error && (
        <div className="empty-state">
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button className="btn btn-ghost" onClick={load}>Retry</button>
        </div>
      )}

      {!loading && !error && castings.length === 0 && (
        <div className="empty-state">
          <h3>No open castings found</h3>
          <p>Check back later for new opportunities.</p>
        </div>
      )}

      {!loading && !error && castings.length > 0 && (
        <div className="card-grid">
          {castings.map((casting, i) => {
            const meta = casting.submission ? STATUS_META[casting.submission.status] : null
            return (
              <div
                key={casting.id}
                className={`card glass glass-hover animate-in animate-in-d${(i % 5) + 1}`}
                onClick={() => setSelected(casting)}
              >
                {meta && <span className={`badge ${meta.className}`}>{meta.label}</span>}
                <h3 className="card-title" style={{ marginTop: 12 }}>{casting.title}</h3>
                <p className="card-sub">{casting.projectName}</p>
                {casting.description && <p className="card-sub">{casting.description}</p>}
                <div className="card-meta">
                  <span>{casting.role}</span>
                  {casting.deadline && <span>Closes {new Date(casting.deadline).toLocaleDateString()}</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selected.title}</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>

            <div className="detail-row"><strong>Project</strong><span>{selected.projectName}</span></div>
            <div className="detail-row"><strong>Role</strong><span>{selected.role}</span></div>
            {selected.deadline && (
              <div className="detail-row"><strong>Deadline</strong><span>{new Date(selected.deadline).toLocaleDateString()}</span></div>
            )}

            {selected.description && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Description</div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{selected.description}</div>
              </div>
            )}

            {selected.requirements && (
              <div className="glass" style={{ padding: 16, borderRadius: 'var(--radius-md)', marginTop: 16, fontSize: 14 }}>
                <strong style={{ color: 'var(--text-secondary)' }}>Requirements:</strong>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{selected.requirements}</span>
              </div>
            )}

            {selected.submission && (
              <div style={{ marginTop: 20, borderTop: '1px solid var(--glass-border)', paddingTop: 16 }}>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>Your Submission</div>
                <span className={`badge ${STATUS_META[selected.submission.status]?.className ?? 'badge-pending'}`}>
                  {STATUS_META[selected.submission.status]?.label ?? selected.submission.status}
                </span>
                {selected.submission.feedback && (
                  <div style={{ marginTop: 12, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {selected.submission.feedback}
                  </div>
                )}
              </div>
            )}
            {selected.roundStatus === 'open' && !selected.submission && (
              <div style={{ marginTop: 20, borderTop: '1px solid var(--glass-border)', paddingTop: 16 }}>
                <button className="btn btn-primary" onClick={() => setShowUpload(true)}>Upload Video Submission</button>
              </div>
            )}
          </div>
        </div>
      )}

      {showUpload && selected && (
        <UploadVideoModal
          castingId={selected.id}
          actorId={ACTOR_ID}
          onClose={() => setShowUpload(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  )
}
