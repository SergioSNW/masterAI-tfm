import type { CreateActorInput } from '../services/actorService'

interface Props {
  onSubmit: (data: CreateActorInput) => Promise<void>
  onClose: () => void
}

export function CreateActorModal({ onSubmit, onClose }: Props) {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const data: CreateActorInput = {
      name: form.get('name') as string,
      email: form.get('email') as string,
      phone: (form.get('phone') as string) || undefined,
      profilePictureUrl: (form.get('profilePictureUrl') as string) || undefined,
    }
    await onSubmit(data)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Actor</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {(['name', 'email', 'phone', 'profilePictureUrl'] as const).map(field => (
              <div key={field}>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  {field === 'profilePictureUrl' ? 'Profile Picture URL' : field.charAt(0).toUpperCase() + field.slice(1)}
                  {field === 'name' || field === 'email' ? ' *' : ''}
                </label>
                <input
                  name={field}
                  type={field === 'email' ? 'email' : field === 'profilePictureUrl' ? 'url' : 'text'}
                  required={field === 'name' || field === 'email'}
                  placeholder={
                    field === 'profilePictureUrl'
                      ? 'https://example.com/photo.jpg'
                      : field === 'phone'
                        ? '+44 123 456 789'
                        : undefined
                  }
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
            ))}
          </div>

          <div className="action-buttons">
            <button type="submit" className="btn btn-primary">Create Actor</button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
