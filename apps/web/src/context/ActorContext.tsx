import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { fetchActors, type ActorDTO } from '../services/actorService'

export type ViewMode = 'list' | 'grid'

interface ActorState {
  actors: ActorDTO[]
  filtered: ActorDTO[]
  viewMode: ViewMode
  searchQuery: string
  activeLetter: string | null
  currentPage: number
  itemsPerPage: number
  totalPages: number
  selectedActor: ActorDTO | null
  loading: boolean
  error: string | null
}

interface ActorActions {
  fetch: (search?: string) => Promise<void>
  setViewMode: (mode: ViewMode) => void
  setSearchQuery: (query: string) => void
  setActiveLetter: (letter: string | null) => void
  setCurrentPage: (page: number) => void
  selectActor: (actor: ActorDTO) => void
  closeModal: () => void
}

type ActorContextValue = ActorState & ActorActions

const ActorContext = createContext<ActorContextValue | null>(null)

export function useActorContext() {
  const ctx = useContext(ActorContext)
  if (!ctx) throw new Error('useActorContext must be used within ActorProvider')
  return ctx
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function filterActors(actors: ActorDTO[], query: string, letter: string | null): ActorDTO[] {
  let result = actors
  if (query) {
    const q = query.toLowerCase()
    result = result.filter(a => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q))
  }
  if (letter) {
    result = result.filter(a => a.name.toUpperCase().startsWith(letter))
  }
  return result.sort((a, b) => a.name.localeCompare(b.name))
}

export function ActorProvider({ children }: { children: ReactNode }) {
  const [actors, setActors] = useState<ActorDTO[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeLetter, setActiveLetter] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedActor, setSelectedActor] = useState<ActorDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const itemsPerPage = 12

  const fetch = useCallback(async (search?: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchActors(search)
      setActors(data)
    } catch {
      setError('Failed to load actors')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const filtered = filterActors(actors, searchQuery, activeLetter)
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = filtered.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage)

  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }, [])

  const handleSetActiveLetter = useCallback((letter: string | null) => {
    setActiveLetter(letter)
    setCurrentPage(1)
  }, [])

  const selectActor = useCallback((actor: ActorDTO) => setSelectedActor(actor), [])
  const closeModal = useCallback(() => setSelectedActor(null), [])

  return (
    <ActorContext.Provider
      value={{
        actors,
        filtered: paginated,
        viewMode,
        searchQuery,
        activeLetter,
        currentPage: safePage,
        itemsPerPage,
        totalPages,
        selectedActor,
        loading,
        error,
        fetch,
        setViewMode,
        setSearchQuery: handleSetSearchQuery,
        setActiveLetter: handleSetActiveLetter,
        setCurrentPage,
        selectActor,
        closeModal,
      }}
    >
      {children}
    </ActorContext.Provider>
  )
}
