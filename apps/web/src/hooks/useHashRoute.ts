import { useState, useCallback } from 'react'

export function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash.slice(1) || 'projects')

  const navigate = useCallback((path: string) => {
    window.location.hash = path
    setHash(path)
  }, [])

  window.addEventListener('hashchange', () => {
    setHash(window.location.hash.slice(1) || 'projects')
  })

  return { route: hash, navigate }
}
