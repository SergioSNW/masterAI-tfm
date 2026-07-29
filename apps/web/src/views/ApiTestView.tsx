import { useEffect, useState } from 'react'
import { get } from '../services/api'

interface Actor {
  id: string
  email: string
  name: string
  bio: string | null
  createdAt: string
}

export function ApiTestView() {
  const [data, setData] = useState<unknown>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    get<Actor[]>('/actors')
      .then(res => { if (!cancelled) { setData(res); console.log('[ApiTest] GET /api/actors OK', res) } })
      .catch(err => { if (!cancelled) { setError(err?.error ?? 'Request failed'); console.error('[ApiTest] GET /api/actors FAIL', err) } })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>API Tracer Bullet</h2>
      <p style={{ marginBottom: 12, color: 'var(--text-secondary)' }}>
        <code>GET /api/actors</code>
      </p>

      {loading && <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>Loading…</div>}

      {error && (
        <div style={{ padding: 16, background: 'rgba(255,80,80,0.1)', borderRadius: 8, color: '#ff6b6b' }}>
          ❌ {error}
        </div>
      )}

      {data !== null && (
        <pre style={{
          padding: 16,
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 8,
          fontSize: 13,
          overflow: 'auto',
          maxHeight: 400,
        }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}

      <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
        API base: <code>{import.meta.env.VITE_API_BASE_URL ?? '/api'}</code>
      </div>
    </div>
  )
}
