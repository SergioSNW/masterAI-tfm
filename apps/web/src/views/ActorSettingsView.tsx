import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { User, Mail, Phone, FileText, Building, Save } from 'lucide-react'
import { fetchActor, updateActor } from '../services/actorService'
import type { ActorDTO } from '../services/actorService'

const ACTOR_ID = import.meta.env.VITE_ACTOR_ID ?? 'a1'

export function ActorSettingsView() {
  const [actor, setActor] = useState<ActorDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchActor(ACTOR_ID)
      .then(setActor)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  function update<K extends keyof ActorDTO>(key: K, value: ActorDTO[K]) {
    setActor(prev => (prev ? { ...prev, [key]: value } : prev))
  }

  async function handleSave() {
    if (!actor) return
    setSaving(true)
    try {
      const saved = await updateActor({
        id: actor.id,
        name: actor.name,
        email: actor.email,
        phone: actor.phone,
        bio: actor.bio,
        agency: actor.agency,
      })
      setActor(saved)
      toast.success('Profile saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
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
    transition: 'border-color 200ms, box-shadow 200ms',
  }

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    resize: 'vertical',
    minHeight: 80,
  }

  return (
    <div className="animate-in">
      <div className="detail-header">
        <div className="detail-header-left">
          <h1>Settings</h1>
          <p>Manage your actor profile</p>
        </div>
      </div>

      {loading && (
        <div className="empty-state">
          <h3>Loading profile...</h3>
        </div>
      )}

      {!loading && error && (
        <div className="empty-state">
          <h3>Something went wrong</h3>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && actor && (
        <div className="card-grid" style={{ maxWidth: 600 }}>
          <div className="card glass" style={{ padding: 24, cursor: 'default' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <User size={20} style={{ color: 'var(--accent-1)' }} />
              <h3 className="card-title" style={{ margin: 0 }}>Actor Profile</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <User size={14} /> Name
                  </div>
                </label>
                <input
                  value={actor.name}
                  onChange={e => update('name', e.target.value)}
                  disabled={saving}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Mail size={14} /> Email
                  </div>
                </label>
                <input
                  type="email"
                  value={actor.email}
                  onChange={e => update('email', e.target.value)}
                  disabled={saving}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Phone size={14} /> Phone
                  </div>
                </label>
                <input
                  placeholder="+1 (555) 123-4567"
                  value={actor.phone ?? ''}
                  onChange={e => update('phone', e.target.value)}
                  disabled={saving}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Building size={14} /> Agency
                  </div>
                </label>
                <input
                  placeholder="e.g. Skywalker Talent"
                  value={actor.agency ?? ''}
                  onChange={e => update('agency', e.target.value)}
                  disabled={saving}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FileText size={14} /> Bio
                  </div>
                </label>
                <textarea
                  placeholder="Tell casting directors about yourself..."
                  value={actor.bio ?? ''}
                  onChange={e => update('bio', e.target.value)}
                  disabled={saving}
                  style={textareaStyle}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Saving...
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <Save size={16} /> Save Changes
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
