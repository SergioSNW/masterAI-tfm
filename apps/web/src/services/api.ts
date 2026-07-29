const BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

export interface ApiError {
  error: string | { fieldErrors: Record<string, string[]>; formErrors: string[] }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw body as ApiError
  }

  return res.json()
}

export function get<T>(url: string): Promise<T> {
  return request<T>(url)
}

export function post<T>(url: string, body: unknown): Promise<T> {
  return request<T>(url, { method: 'POST', body: JSON.stringify(body) })
}

export function put<T>(url: string, body: unknown): Promise<T> {
  return request<T>(url, { method: 'PUT', body: JSON.stringify(body) })
}

export function del<T = void>(url: string): Promise<T> {
  return request<T>(url, { method: 'DELETE' })
}
