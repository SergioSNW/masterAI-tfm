import { useState } from 'react'
import type { Round, Submission } from '../data/mock'
import { UploadVideoModal } from '../components/UploadVideoModal'
import { reviewSubmission } from '../services/submissionService'

interface Props {
  round: Round
  onBack: () => void
  onReview?: (submissionId: string, status: 'shortlisted' | 'reviewed' | 'rejected', feedback?: string) => void
}

export function RoundDetailView({ round, onBack, onReview }: Props) {
  const [submissions, setSubmissions] = useState<Submission[]>(round.submissions)
  const [selected, setSelected] = useState<Submission | null>(null)
  const [feedback, setFeedback] = useState('')
  const [showUpload, setShowUpload] = useState(false)

  async function handleReview(submissionId: string, status: 'shortlisted' | 'reviewed' | 'rejected') {
    const sub = submissions.find(s => s.id === submissionId)
    if (!sub) return

    const updated: Submission = { ...sub, status, feedback: feedback || sub.feedback }
    setSubmissions(prev => prev.map(s => s.id === submissionId ? updated : s))
    setSelected(null)
    setFeedback('')

    reviewSubmission({ submissionId, status, feedback: feedback || undefined }).catch(() => {})
    onReview?.(submissionId, status, feedback || undefined)
  }

  const statusCounts = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    shortlisted: submissions.filter(s => s.status === 'shortlisted').length,
    reviewed: submissions.filter(s => s.status === 'reviewed').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
  }

  return (
    <div className="animate-in">
      <button className="back-btn" onClick={onBack}>← Back to Casting</button>

      <div className="detail-header">
        <div className="detail-header-left">
          <h1>{round.name}</h1>
          <p>{round.description}</p>
        </div>
        <div className="detail-header-right">
          <span className={`badge badge-${round.status}`}>{round.status}</span>
          {round.status === 'open' && (
            <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
              + Upload Video
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total', value: statusCounts.total, color: 'var(--text-primary)' },
          { label: 'Pending', value: statusCounts.pending, color: 'var(--warning)' },
          { label: 'Shortlisted', value: statusCounts.shortlisted, color: 'var(--success)' },
          { label: 'Reviewed', value: statusCounts.reviewed, color: 'var(--accent-1)' },
          { label: 'Rejected', value: statusCounts.rejected, color: 'var(--danger)' },
        ].map((stat) => (
          <div key={stat.label} className="glass" style={{ flex: 1, padding: '16px 20px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Submissions</h2>

      <div className="submission-list">
        {submissions.map((sub) => (
          <div
            key={sub.id}
            className="submission-card glass glass-hover"
            onClick={() => { setSelected(sub); setFeedback(sub.feedback || '') }}
          >
            <div className="submission-avatar" style={{ background: sub.avatarColor }}>
              {sub.actorName.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="submission-info">
              <h4>{sub.actorName}</h4>
              <span>{sub.actorEmail} · Submitted {new Date(sub.createdAt).toLocaleDateString()}</span>
            </div>
            <span className={`badge badge-${sub.status === 'reviewed' ? 'active' : sub.status}`}>
              {sub.status}
            </span>
          </div>
        ))}

        {submissions.length === 0 && (
          <div className="empty-state">
            <h3>No submissions yet</h3>
            <p>Upload a video to get started.</p>
          </div>
        )}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selected.actorName}</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>

            {selected.videoUrl.startsWith('data:') ? (
              <video controls style={{ width: '100%', borderRadius: 'var(--radius-md)', marginBottom: 16, maxHeight: 360 }} src={selected.videoUrl}>
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="video-placeholder">🎬</div>
            )}

            <div className="detail-row"><strong>Email</strong><span>{selected.actorEmail}</span></div>
            <div className="detail-row"><strong>Status</strong><span className={`badge badge-${selected.status === 'reviewed' ? 'active' : selected.status}`}>{selected.status}</span></div>
            <div className="detail-row"><strong>Submitted</strong><span>{new Date(selected.createdAt).toLocaleDateString()}</span></div>
            {selected.notes && <div className="detail-row"><strong>Notes</strong><span>{selected.notes}</span></div>}

            <div style={{ marginTop: 20 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Feedback</label>
              <textarea
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Write your feedback..."
                style={{
                  width: '100%', padding: 12, borderRadius: 'var(--radius-sm)',
                  background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)', fontFamily: 'var(--font)', fontSize: 14,
                  resize: 'vertical', minHeight: 80, outline: 'none',
                }}
              />
            </div>

            <div className="action-buttons">
              <button className="btn btn-primary" onClick={() => handleReview(selected.id, 'shortlisted')}>Shortlist</button>
              <button className="btn btn-ghost" onClick={() => handleReview(selected.id, 'reviewed')}>Mark Reviewed</button>
              <button className="btn btn-ghost" style={{ marginLeft: 'auto', color: 'var(--danger)' }} onClick={() => handleReview(selected.id, 'rejected')}>Reject</button>
            </div>
          </div>
        </div>
      )}

      {showUpload && (
        <UploadVideoModal
          roundId={round.id}
          onClose={() => setShowUpload(false)}
          onSuccess={() => {}}
        />
      )}
    </div>
  )
}
