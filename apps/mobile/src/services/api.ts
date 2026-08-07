function normalizeApiBase(url: string): string {
  const trimmed = url.replace(/\/+$/, '')
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`
}

const API_BASE = normalizeApiBase(
  process.env.EXPO_PUBLIC_API_URL ?? 'https://master-ai-tfm.vercel.app',
)

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const url = `${API_BASE}${path}`
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })

  const contentType = res.headers.get('content-type') ?? ''

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error')
    console.log(`[api] ${method} ${url} -> ${res.status} ${contentType}`, text.slice(0, 500))
    throw new ApiError(text, res.status)
  }

  if (!contentType.includes('application/json')) {
    const text = await res.text().catch(() => '')
    console.log(`[api] ${method} ${url} -> non-JSON response (${contentType})`, text.slice(0, 500))
    throw new ApiError(text || `Expected JSON but received ${contentType}`, res.status)
  }

  return res.json() as Promise<T>
}

export function get<T>(path: string): Promise<T> {
  return request<T>('GET', path)
}

export function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>('POST', path, body)
}
