import type { CreateActorInput } from '../services/actorService'

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

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  color: 'var(--text-secondary)',
  marginBottom: 6,
}

interface Props {
  onSubmit: (data: CreateActorInput) => Promise<void>
  onClose: () => void
  initial?: CreateActorInput
}

export function CreateActorModal({ onSubmit, onClose, initial }: Props) {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const data: CreateActorInput = {
      name: form.get('name') as string,
      email: form.get('email') as string,
      phone: (form.get('phone') as string) || undefined,
      profilePictureUrl: (form.get('profilePictureUrl') as string) || undefined,
      bio: (form.get('bio') as string) || undefined,
      agency: (form.get('agency') as string) || undefined,
      availability: (form.get('availability') as string) || 'Available',
      preferredRoles: (form.get('preferredRoles') as string) || undefined,
      castingStage: (form.get('castingStage') as string) || 'Pending',
    }
    await onSubmit(data)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initial ? 'Edit Actor' : 'New Actor'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Name *</label>
              <input name="name" required defaultValue={initial?.name} style={inputStyle} placeholder="Full name" />
            </div>
            <div>
              <label style={labelStyle}>Email *</label>
              <input name="email" type="email" required defaultValue={initial?.email} style={inputStyle} placeholder="actor@example.com" />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input name="phone" defaultValue={initial?.phone} style={inputStyle} placeholder="+44 123 456 789" />
            </div>
            <div>
              <label style={labelStyle}>Profile Picture URL</label>
              <input name="profilePictureUrl" type="url" defaultValue={initial?.profilePictureUrl} style={inputStyle} placeholder="https://example.com/photo.jpg" />
            </div>
            <div>
              <label style={labelStyle}>Bio</label>
              <textarea name="bio" rows={3} defaultValue={initial?.bio} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Short biography..." />
            </div>
            <div>
              <label style={labelStyle}>Agency</label>
              <input name="agency" defaultValue={initial?.agency} style={inputStyle} placeholder="e.g. CAA, WME" />
            </div>
            <div>
              <label style={labelStyle}>Availability</label>
              <select name="availability" defaultValue={initial?.availability ?? 'Available'} style={inputStyle}>
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
                <option value="Limited">Limited</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Preferred Roles</label>
              <input name="preferredRoles" defaultValue={initial?.preferredRoles} style={inputStyle} placeholder="e.g. Lead, Supporting" />
            </div>
            <div>
              <label style={labelStyle}>Casting Stage</label>
              <select name="castingStage" defaultValue={initial?.castingStage ?? 'Pending'} style={inputStyle}>
                <option value="Pending">Pending</option>
                <option value="First Round">First Round</option>
                <option value="Callback">Callback</option>
                <option value="Casted">Casted</option>
              </select>
            </div>
          </div>

          <div className="action-buttons">
            <button type="submit" className="btn btn-primary">{initial ? 'Save Changes' : 'Create Actor'}</button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
