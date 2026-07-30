import { useState } from 'react'
import { X, Mail, Phone, Calendar, FileText, Building, ListTodo, Star, RefreshCw } from 'lucide-react'
import { useActorContext } from '../context/ActorContext'
import type { UpdateActorInput } from '../services/actorService'

export function ActorModal() {
  const { selectedActor: actor, modalMode, closeModal, updateActor, deleteActor } = useActorContext()
  const [editMode, setEditMode] = useState(modalMode === 'edit')

  if (!actor) return null
  const a = actor!

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const input: UpdateActorInput = {
      id: a.id,
      name: form.get('name') as string,
      email: form.get('email') as string,
      phone: (form.get('phone') as string) || undefined,
      profilePictureUrl: (form.get('profilePictureUrl') as string) || undefined,
      bio: (form.get('bio') as string) || undefined,
      agency: (form.get('agency') as string) || undefined,
      availability: (form.get('availability') as string) || 'Available',
      preferredRoles: (form.get('preferredRoles') as string) || undefined,
      castingStage: form.get('castingStage') as string,
    }
    await updateActor(input)
    setEditMode(false)
  }

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this actor?')) return
    await deleteActor(a.id)
    closeModal()
  }

  const stageColors: Record<string, string> = {
    Pending: 'var(--warning)',
    'First Round': 'var(--accent-1)',
    Callback: 'var(--accent-2)',
    Casted: 'var(--success)',
  }

  if (editMode) {
    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content glass-strong" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={closeModal}><X size={18} /></button>
          <div className="modal-header">
            <h2 className="modal-title">Edit Actor</h2>
          </div>
          <form onSubmit={handleSave}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Name *</label>
                <input name="name" required defaultValue={a.name} className="edit-input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Email *</label>
                <input name="email" type="email" required defaultValue={a.email} className="edit-input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Phone</label>
                <input name="phone" defaultValue={a.phone ?? ''} className="edit-input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Profile Picture URL</label>
                <input name="profilePictureUrl" type="url" defaultValue={a.profilePictureUrl ?? ''} className="edit-input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Bio</label>
                <textarea name="bio" rows={3} defaultValue={a.bio ?? ''} className="edit-input" style={{ resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Agency</label>
                <input name="agency" defaultValue={a.agency ?? ''} className="edit-input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Availability</label>
                <select name="availability" defaultValue={a.availability ?? 'Available'} className="edit-input">
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                  <option value="Limited">Limited</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Preferred Roles</label>
                <input name="preferredRoles" defaultValue={a.preferredRoles ?? ''} className="edit-input" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Casting Stage</label>
                <select name="castingStage" defaultValue={a.castingStage ?? 'Pending'} className="edit-input">
                  <option value="Pending">Pending</option>
                  <option value="First Round">First Round</option>
                  <option value="Callback">Callback</option>
                  <option value="Casted">Casted</option>
                </select>
              </div>
            </div>
            <div className="action-buttons">
              <button type="submit" className="btn btn-primary">Save Changes</button>
              <button type="button" className="btn btn-ghost" onClick={() => setEditMode(false)}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content glass-strong" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={closeModal}><X size={18} /></button>

        <div className="modal-header">
          {a.profilePictureUrl ? (
            <img src={a.profilePictureUrl} alt={a.name} className="modal-avatar-img" />
          ) : (
            <div className="avatar" style={{ width: 64, height: 64, fontSize: 22 }}>
              {a.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
          )}
          <div>
            <h2 className="modal-title">{a.name}</h2>
            <p className="modal-sub">{a.email}</p>
            {a.castingStage && (
              <span
                style={{
                  display: 'inline-block',
                  marginTop: 6,
                  padding: '2px 8px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 600,
                  background: `${stageColors[a.castingStage] ?? 'var(--warning)'}22`,
                  color: stageColors[a.castingStage] ?? 'var(--warning)',
                  border: `1px solid ${stageColors[a.castingStage] ?? 'var(--warning)'}44`,
                }}
              >
                {a.castingStage}
              </span>
            )}
          </div>
        </div>

        <div className="modal-body">
          <div className="modal-info-row"><Mail size={16} /><span>{a.email}</span></div>
          {a.phone && <div className="modal-info-row"><Phone size={16} /><span>{a.phone}</span></div>}
          <div className="modal-info-row"><Calendar size={16} /><span>Joined {new Date(a.createdAt).toLocaleDateString()}</span></div>
          {a.bio && <div className="modal-info-row" style={{ alignItems: 'flex-start' }}><FileText size={16} style={{ marginTop: 2 }} /><span>{a.bio}</span></div>}
          {a.agency && <div className="modal-info-row"><Building size={16} /><span>{a.agency}</span></div>}
          {a.availability && <div className="modal-info-row"><RefreshCw size={16} /><span>{a.availability}</span></div>}
          {a.preferredRoles && <div className="modal-info-row"><Star size={16} /><span>{a.preferredRoles}</span></div>}
        </div>

        <div className="action-buttons">
          <button className="btn btn-primary" onClick={() => setEditMode(true)}>Edit</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </div>
    </div>
  )
}
