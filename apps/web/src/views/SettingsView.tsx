import { useState } from 'react'
import { getProfile, saveProfile } from '../services/profileService'

export function SettingsView() {
  const [profile, setProfile] = useState(getProfile)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    saveProfile(profile)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div>
      <div className="detail-header">
        <div className="detail-header-left">
          <h1>Settings</h1>
        </div>
      </div>

      <div className="card-grid" style={{ maxWidth: 600 }}>
        <div className="card glass" style={{ padding: 24 }}>
          <h3 className="card-title" style={{ marginBottom: 8 }}>Director Profile</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Name</label>
              <input
                value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font)',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>Email</label>
              <input
                value={profile.email}
                onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font)',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
              <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
              {saved && <span style={{ fontSize: 13, color: 'var(--success)' }}>Saved!</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
