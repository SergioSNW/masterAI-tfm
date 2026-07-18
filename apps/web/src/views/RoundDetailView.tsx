import { useState, useEffect } from 'react'
import type { Round, Submission } from '../data/mock'
import { UploadVideoModal } from '../components/UploadVideoModal'
import { reviewSubmission } from '../services/submissionService'
import { fetchComments, createComment } from '../services/commentService'
import type { CommentDTO } from '../services/commentService'
import { fetchAttachments, addAttachment, downloadAttachment } from '../services/attachmentService'
import type { AttachmentDTO } from '../services/attachmentService'

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
  const [comments, setComments] = useState<CommentDTO[]>([])
  const [commentInput, setCommentInput] = useState('')
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [attachments, setAttachments] = useState<AttachmentDTO[]>([])
  const [attachmentsLoading, setAttachmentsLoading] = useState(false)

  useEffect(() => {
    setAttachmentsLoading(true)
    fetchAttachments(round.id).then(data => {
      setAttachments(data)
      setAttachmentsLoading(false)
    })
  }, [round.id])

  useEffect(() => {
    if (selected) {
      setCommentsLoading(true)
      fetchComments(selected.id).then(data => {
        setComments(data)
        setCommentsLoading(false)
      })
      setCommentInput('')
    }
  }, [selected])

  async function handleAddComment() {
    if (!selected || !commentInput.trim()) return
    const comment = await createComment({
      submissionId: selected.id,
      authorName: 'Director',
      content: commentInput.trim(),
    })
    setComments(prev => [...prev, comment])
    setCommentInput('')
  }

  async function handleAddAttachment() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,.png,.jpg,.jpeg,.txt'
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      if (file.size > 10 * 1024 * 1024) return

      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1]
        const attachment = await addAttachment({
          roundId: round.id,
          fileName: file.name,
          fileType: file.type,
          fileData: base64,
          fileSize: file.size,
        })
        setAttachments(prev => [attachment, ...prev])
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

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

      <div className="detail-section">
        <div className="detail-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Attachments {attachments.length > 0 && `(${attachments.length})`}</h2>
          {round.status === 'open' && (
            <button className="btn btn-primary" onClick={handleAddAttachment} style={{ fontSize: 13, padding: '6px 14px' }}>
              + Upload File
            </button>
          )}
        </div>
        {attachmentsLoading ? (
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)', padding: '8px 0' }}>Loading attachments...</div>
        ) : attachments.length === 0 ? (
          <div className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📄</div>
            <p style={{ fontSize: 14, color: 'var(--text-tertiary)', margin: 0 }}>No attachments yet. Upload scripts, contracts, or reference materials.</p>
          </div>
        ) : (
          <div style={{ marginBottom: 24 }}>
            {attachments.map(a => (
              <div key={a.id} className="glass" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', marginBottom: 8, borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{a.fileType === 'application/pdf' ? '📕' : '📎'}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{a.fileName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                      {(a.fileSize / 1024).toFixed(1)} KB · {new Date(a.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <button className="btn btn-ghost" onClick={() => downloadAttachment(a)} style={{ fontSize: 13, padding: '4px 12px' }}>
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
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

            <div style={{ marginTop: 20, borderTop: '1px solid var(--glass-border)', paddingTop: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Comments {comments.length > 0 && `(${comments.length})`}
              </label>
              {commentsLoading ? (
                <div style={{ fontSize: 13, color: 'var(--text-tertiary)', padding: '8px 0' }}>Loading comments...</div>
              ) : comments.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--text-tertiary)', padding: '8px 0' }}>No comments yet.</div>
              ) : (
                <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 12 }}>
                  {comments.map(c => (
                    <div key={c.id} style={{
                      background: 'var(--glass-bg)', borderRadius: 'var(--radius-sm)',
                      padding: '8px 12px', marginBottom: 8,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-1)' }}>{c.authorName}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>{c.content}</p>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                  placeholder="Add a comment..."
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)', fontFamily: 'var(--font)', fontSize: 13,
                    outline: 'none',
                  }}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleAddComment}
                  disabled={!commentInput.trim()}
                  style={{ padding: '8px 16px', fontSize: 13 }}
                >
                  Send
                </button>
              </div>
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
