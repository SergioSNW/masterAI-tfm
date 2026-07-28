import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Image, X, ExternalLink } from 'lucide-react'

interface UploadedFile {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  url: string
  createdAt: string
}

interface DocumentUploadZoneProps {
  attachments: UploadedFile[]
  uploading: boolean
  onUpload: (file: File) => Promise<void>
  onRemove: (id: string) => void
  disabled?: boolean
}

export function DocumentUploadZone({ attachments, uploading, onUpload, onRemove, disabled }: DocumentUploadZoneProps) {
  const [dragOver, setDragOver] = useState(false)

  const onDrop = useCallback(async (accepted: File[]) => {
    if (accepted.length === 0 || uploading || disabled) return
    await onUpload(accepted[0])
  }, [onUpload, uploading, disabled])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: uploading || disabled,
    multiple: false,
    onDragEnter: () => setDragOver(true),
    onDragLeave: () => setDragOver(false),
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className={`drop-zone ${isDragActive || dragOver ? 'active' : ''}`}
        role="button"
        tabIndex={0}
        aria-label="Upload file"
        style={{ marginBottom: 16, cursor: uploading || disabled ? 'not-allowed' : 'pointer', opacity: uploading || disabled ? 0.6 : 1 }}
      >
        <input {...getInputProps()} />
        <div className="drop-zone-icon">
          {uploading ? (
            <div className="spinner" />
          ) : (
            <Upload size={28} />
          )}
        </div>
        <div className="drop-zone-text">
          {uploading ? 'Uploading...' : isDragActive ? 'Drop file here' : 'Drag & drop a file here, or click to browse'}
        </div>
        <div className="drop-zone-hint">PDF, DOC, PNG, JPG, TXT, MP4 — Max 50 MB</div>
      </div>

      {attachments.map(a => (
        <div key={a.id} className="glass" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', marginBottom: 8, borderRadius: 'var(--radius-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>
              {a.fileType === 'application/pdf' ? <FileText size={20} /> : a.fileType.startsWith('image/') ? <Image size={20} /> : <FileText size={20} />}
            </span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{a.fileName}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                {(a.fileSize / 1024).toFixed(1)} KB · {new Date(a.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-icon" onClick={(e) => { e.stopPropagation(); window.open(a.url, '_blank') }} title="View file">
              <ExternalLink size={16} />
            </button>
            <button className="btn-icon" onClick={(e) => { e.stopPropagation(); onRemove(a.id) }} title="Remove file">
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
