import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { toast } from 'sonner'
import {
  fetchActors,
  createActor as apiCreateActor,
  updateActor as apiUpdateActor,
  deleteActor as apiDeleteActor,
  type ActorDTO,
  type CreateActorInput,
  type UpdateActorInput,
} from '../services/actorService'

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
  modalMode: 'view' | 'edit'
  loading: boolean
  error: string | null
}

interface ActorActions {
  fetch: (search?: string) => Promise<void>
  setViewMode: (mode: ViewMode) => void
  setSearchQuery: (query: string) => void
  setActiveLetter: (letter: string | null) => void
  setCurrentPage: (page: number) => void
  selectActor: (actor: ActorDTO, mode?: 'view' | 'edit') => void
  closeModal: () => void
  createActor: (input: CreateActorInput) => Promise<void>
  updateActor: (input: UpdateActorInput) => Promise<void>
  deleteActor: (id: string) => Promise<void>
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
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view')
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

  const selectActor = useCallback((actor: ActorDTO, mode: 'view' | 'edit' = 'view') => {
    setSelectedActor(actor)
    setModalMode(mode)
  }, [])

  const closeModal = useCallback(() => {
    setSelectedActor(null)
    setModalMode('view')
  }, [])

  const createActor = useCallback(async (input: CreateActorInput) => {
    const optimistic: ActorDTO = {
      id: `optimistic-${Date.now()}`,
      email: input.email,
      name: input.name,
      phone: input.phone,
      profilePictureUrl: input.profilePictureUrl,
      bio: input.bio,
      agency: input.agency,
      availability: input.availability ?? 'Available',
      preferredRoles: input.preferredRoles,
      castingStage: input.castingStage ?? 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setActors(prev => [optimistic, ...prev])
    try {
      const created = await apiCreateActor(input)
      setActors(prev => prev.map(a => a.id === optimistic.id ? created : a))
      toast.success('Actor created')
    } catch {
      setActors(prev => prev.filter(a => a.id !== optimistic.id))
      toast.error('Failed to create actor')
      throw new Error('Failed to create actor')
    }
  }, [])

  const updateActor = useCallback(async (input: UpdateActorInput) => {
    const prev = actors
    setActors(prevActors =>
      prevActors.map(a => a.id === input.id ? { ...a, ...input, updatedAt: new Date().toISOString() } : a)
    )
    try {
      const updated = await apiUpdateActor(input)
      setActors(prevActors =>
        prevActors.map(a => a.id === updated.id ? updated : a)
      )
      toast.success('Actor updated')
    } catch {
      setActors(prev)
      toast.error('Failed to update actor')
      throw new Error('Failed to update actor')
    }
  }, [actors])

  const deleteActor = useCallback(async (id: string) => {
    const prev = actors
    setActors(prevActors => prevActors.filter(a => a.id !== id))
    try {
      await apiDeleteActor(id)
      toast.success('Actor deleted')
    } catch {
      setActors(prev)
      toast.error('Failed to delete actor')
    }
  }, [actors])

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
        modalMode,
        loading,
        error,
        fetch,
        setViewMode,
        setSearchQuery: handleSetSearchQuery,
        setActiveLetter: handleSetActiveLetter,
        setCurrentPage,
        selectActor,
        closeModal,
        createActor,
        updateActor,
        deleteActor,
      }}
    >
      {children}
    </ActorContext.Provider>
  )
}
