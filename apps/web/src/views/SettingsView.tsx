import { useState } from 'react'
import { getProfile, saveProfile } from '../services/profileService'
import { toast } from 'sonner'
import { User, Mail, Building, Phone, FileText, Save } from 'lucide-react'

export function SettingsView() {
  const [profile, setProfile] = useState(getProfile)
  const [saving, setSaving] = useState(false)

  function update<K extends keyof typeof profile>(key: K, value: (typeof profile)[K]) {
    setProfile(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      await new Promise(r => setTimeout(r, 400))
      saveProfile(profile)
      toast.success('Profile saved')
    } catch {
      toast.error('Failed to save profile')
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
    // position: 'relative',
    // zIndex: 10,
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
          <p>Manage your profile and preferences</p>
        </div>
      </div>

      <div className="card-grid" style={{ maxWidth: 600 }}>
        <div className="card glass" style={{ padding: 24, cursor: 'default' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <User size={20} style={{ color: 'var(--accent-1)' }} />
            <h3 className="card-title" style={{ margin: 0 }}>Director Profile</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={14} /> Name
                </div>
              </label>
              <input
                value={profile.name}
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
                value={profile.email}
                onChange={e => update('email', e.target.value)}
                disabled={saving}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Building size={14} /> Company
                </div>
              </label>
              <input
                placeholder="e.g. Skywalker Productions"
                value={profile.company ?? ''}
                onChange={e => update('company', e.target.value)}
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
                value={profile.phone ?? ''}
                onChange={e => update('phone', e.target.value)}
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
                placeholder="Tell us about yourself..."
                value={profile.bio ?? ''}
                onChange={e => update('bio', e.target.value)}
                disabled={saving}
                style={textareaStyle}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4}}>
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
    </div>
  )
}
