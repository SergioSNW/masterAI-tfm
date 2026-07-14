import { useState, useEffect, useCallback } from 'react'
import { fetchActors, createActor, type CreateActorInput, type ActorDTO } from '../services/actorService'
import { CreateActorModal } from '../components/CreateActorModal'

export function ActorsView() {
  const [actors, setActors] = useState<ActorDTO[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (q?: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchActors(q)
      setActors(data)
    } catch {
      setError('Failed to load actors')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const timer = setTimeout(() => load(search || undefined), 300)
    return () => clearTimeout(timer)
  }, [search, load])

  async function handleCreate(data: CreateActorInput) {
    try {
      await createActor(data)
      setShowCreate(false)
      load(search || undefined)
    } catch {
      setError('Failed to create actor')
    }
  }

  return (
    <div>
      <div className="detail-header">
        <div className="detail-header-left">
          <h1>Actors</h1>
          <p>{actors.length} registered actors</p>
        </div>
        <div className="detail-header-right">
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Actor</button>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            maxWidth: 400,
            padding: '10px 16px',
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

      {error && (
        <div className="glass" style={{ padding: 12, borderRadius: 'var(--radius-sm)', marginBottom: 16, color: 'var(--danger)', fontSize: 14 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="empty-state"><h3>Loading...</h3></div>
      ) : actors.length === 0 ? (
        <div className="empty-state">
          <h3>No actors found</h3>
          <p>{search ? 'Try a different search term.' : 'Add your first actor to get started.'}</p>
        </div>
      ) : (
        <div className="card-grid">
          {actors.map((actor, i) => (
            <div key={actor.id} className={`card glass glass-hover animate-in animate-in-d${(i % 5) + 1}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div className="avatar" style={{ width: 40, height: 40, fontSize: 14 }}>
                  {actor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 className="card-title">{actor.name}</h3>
                  <p className="card-sub">{actor.email}</p>
                </div>
              </div>
              {actor.phone && <div className="card-meta"><span>📞 {actor.phone}</span></div>}
              <div className="card-meta">
                <span>Joined {new Date(actor.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateActorModal
          onSubmit={handleCreate}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  )
}
