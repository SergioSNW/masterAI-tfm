import { useState, useEffect, useRef } from 'react'
import { fetchActors, type ActorDTO } from '../services/actorService'
import { uploadVideo } from '../services/submissionService'

interface Props {
  roundId: string
  onClose: () => void
  onSuccess: () => void
}

export function UploadVideoModal({ roundId, onClose, onSuccess }: Props) {
  const [actors, setActors] = useState<ActorDTO[]>([])
  const [search, setSearch] = useState('')
  const [selectedActor, setSelectedActor] = useState<ActorDTO | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [notes, setNotes] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchActors().then(setActors).catch(() => {})
  }, [])

  const filtered = actors.filter(a =>
    !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase())
  )

  function validateFile(f: File): string | null {
    const ext = f.name.toLowerCase().slice(f.name.lastIndexOf('.'))
    if (!['.mp4', '.mov', '.webm'].includes(ext)) return 'Only .mp4, .mov, and .webm files are allowed'
    if (f.size > 5 * 1024 * 1024) return `File exceeds 5MB limit (${(f.size / 1024 / 1024).toFixed(1)}MB)`
    return null
  }

  async function handleSubmit() {
    if (!selectedActor || !file) return

    const validationError = validateFile(file)
    if (validationError) { setError(validationError); return }

    setUploading(true)
    setError(null)

    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1]
        await uploadVideo({ roundId, actorId: selectedActor.id, videoData: base64, fileName: file.name, notes: notes || undefined })
        onSuccess()
        onClose()
      }
      reader.onerror = () => setError('Failed to read file')
      reader.readAsDataURL(file)
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload Video</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {error && (
            <div style={{ padding: 10, borderRadius: 'var(--radius-sm)', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', fontSize: 13 }}>
              {error}
            </div>
          )}

          {!selectedActor ? (
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Select Actor</label>
              <input
                type="text"
                placeholder="Search actors..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)', fontFamily: 'var(--font)', fontSize: 14, outline: 'none', marginBottom: 8,
                }}
              />
              <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {filtered.map(a => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSelectedActor(a)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--glass-bg)',
                      color: 'var(--text-primary)', cursor: 'pointer', fontSize: 14, textAlign: 'left',
                    }}
                  >
                    <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                      {a.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{a.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{a.email}</div>
                    </div>
                  </button>
                ))}
                {filtered.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-tertiary)', padding: 8 }}>No actors found</div>}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 'var(--radius-sm)', background: 'var(--glass-bg)' }}>
              <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                {selectedActor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{selectedActor.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{selectedActor.email}</div>
              </div>
              <button className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setSelectedActor(null)}>Change</button>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Video File (.mp4, .mov, .webm — max 5MB)</label>
            <input
              ref={fileRef}
              type="file"
              accept=".mp4,.mov,.webm"
              onChange={e => setFile(e.target.files?.[0] || null)}
              style={{
                width: '100%', padding: 10, borderRadius: 'var(--radius-sm)',
                background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)', fontSize: 13, outline: 'none',
              }}
            />
            {file && (
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                {file.name} ({(file.size / 1024 / 1024).toFixed(1)}MB)
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Any notes about this submission..."
              style={{
                width: '100%', padding: 10, borderRadius: 'var(--radius-sm)',
                background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)', fontFamily: 'var(--font)', fontSize: 14,
                resize: 'vertical', outline: 'none',
              }}
            />
          </div>

          <div className="action-buttons">
            <button className="btn btn-primary" disabled={!selectedActor || !file || uploading} onClick={handleSubmit}>
              {uploading ? 'Uploading...' : 'Upload Video'}
            </button>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}
