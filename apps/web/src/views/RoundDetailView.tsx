import { useState, useEffect } from 'react'
import type { Round, Submission } from '../data/mock'
import { UploadVideoModal } from '../components/UploadVideoModal'
import { DocumentUploadZone } from '../components/DocumentUploadZone'
import { reviewSubmission, analyzeSubmission } from '../services/submissionService'
import { fetchComments, createComment } from '../services/commentService'
import type { CommentDTO } from '../services/commentService'
import { fetchAttachments, addAttachment, removeAttachment } from '../services/attachmentService'
import type { AttachmentDTO } from '../services/attachmentService'
import { toast } from 'sonner'
import { upload } from '@vercel/blob/client'

interface Props {
  round: Round
  onBack: () => void
  onReview?: (submissionId: string, status: 'shortlisted' | 'reviewed' | 'rejected', feedback?: string) => void
  onRoundStatusChange?: (roundId: string, status: 'open' | 'closed') => void
}

export function RoundDetailView({ round, onBack, onReview, onRoundStatusChange }: Props) {
  const [submissions, setSubmissions] = useState<Submission[]>(round.submissions)
  const [selected, setSelected] = useState<Submission | null>(null)
  const [feedback, setFeedback] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [comments, setComments] = useState<CommentDTO[]>([])
  const [commentInput, setCommentInput] = useState('')
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [attachments, setAttachments] = useState<AttachmentDTO[]>([])
  const [attachmentsLoading, setAttachmentsLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [analyzingId, setAnalyzingId] = useState<string | null>(null)

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

  async function handleUpload(file: File) {
    setUploading(true)
    try {
      const fileType = file.type || 'application/octet-stream'
      const { url } = await upload(file.name, file, {
        handleUploadUrl: '/api/upload',
        access: 'public',
        clientPayload: JSON.stringify({
          fileName: file.name,
          fileType,
          fileSize: file.size,
        }),
      })
      const attachment = await addAttachment({
        roundId: round.id,
        fileName: file.name,
        fileType,
        url,
        fileSize: file.size,
      })
      setAttachments(prev => [attachment, ...prev])
      toast.success('File uploaded')
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === 'object' && err !== null && 'error' in err
            ? String((err as { error: unknown }).error)
            : 'Unknown upload error'
      console.error('[upload] failed:', message, err)
      toast.error(`Upload failed: ${message.slice(0, 140)}`)
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove(id: string) {
    setAttachments(prev => prev.filter(a => a.id !== id))
    await removeAttachment(id)
    toast.success('File removed')
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

  async function handleAnalyze(sub: Submission) {
    setAnalyzingId(sub.id)
    try {
      const result = await analyzeSubmission({ submissionId: sub.id })
      const updated: Submission = {
        ...sub,
        transcript: result.transcript,
        aiScore: result.aiScore,
        aiFeedback: result.aiFeedback,
      }
      setSubmissions(prev => prev.map(s => s.id === sub.id ? updated : s))
      setSelected(updated)
      toast.success('AI analysis complete')
    } catch (err) {
      const message = (err as { error?: string })?.error ?? 'AI analysis failed'
      toast.error(typeof message === 'string' ? message : 'AI analysis failed')
    } finally {
      setAnalyzingId(null)
    }
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
          {round.status === 'pending' && (
            <button className="btn btn-primary" onClick={() => onRoundStatusChange?.(round.id, 'open')}>
              Open Round
            </button>
          )}
          {round.status === 'open' && (
            <button className="btn btn-ghost" onClick={() => onRoundStatusChange?.(round.id, 'closed')}>
              Close Round
            </button>
          )}
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

      <div className="detail-section" style={{ marginBottom: 32 }}>
        <div className="detail-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Attachments {attachments.length > 0 && `(${attachments.length})`}</h2>
        </div>

        {attachmentsLoading ? (
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)', padding: '8px 0' }}>Loading attachments...</div>
        ) : (
          <DocumentUploadZone
            attachments={attachments}
            uploading={uploading}
            onUpload={handleUpload}
            onRemove={handleRemove}
            disabled={round.status !== 'open'}
          />
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

            {/^(https?|data):/.test(selected.videoUrl) ? (
              <video controls style={{ width: '100%', borderRadius: 'var(--radius-md)', marginBottom: 16, maxHeight: 360 }} src={selected.videoUrl}>
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="video-placeholder">🎬</div>
            )}

            <div className="ai-panel" style={{
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <strong style={{ fontSize: 14 }}>AI Analysis</strong>
                {selected.transcript && selected.aiScore != null && (
                  <span className="badge badge-active">{selected.aiScore}/100</span>
                )}
              </div>

              {analyzingId === selected.id ? (
                <div style={{ fontSize: 13, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="spinner" /> Analyzing submission audio... (10–15s)
                </div>
              ) : selected.transcript && selected.aiScore != null ? (
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {selected.aiFeedback && (
                    <p style={{ margin: '0 0 12px', lineHeight: 1.5 }}>{selected.aiFeedback}</p>
                  )}
                  <details style={{ margin: 0 }}>
                    <summary style={{ cursor: 'pointer', color: 'var(--accent-1)', marginBottom: 6 }}>
                      View transcript
                    </summary>
                    <p style={{ margin: 0, fontStyle: 'italic', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {selected.transcript}
                    </p>
                  </details>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: '0 0 12px' }}>
                    Run AI transcription and scoring for this submission.
                  </p>
                  <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => handleAnalyze(selected)}>
                    Generate AI Analysis
                  </button>
                </div>
              )}
            </div>

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
