import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { toast } from 'sonner'
import { updateProjectStatus } from '../services/projectService'
import { openRound, closeRound } from '../services/roundService'
import type { Project, Casting, Round } from '../data/mock'

interface ProjectContextValue {
  projects: Project[]
  updateStatus: (id: string, status: 'draft' | 'active' | 'closed') => Promise<void>
  addProject: (project: Project) => void
  addCasting: (projectId: string, casting: Casting) => void
  addRound: (castingId: string, round: Round) => void
  updateRoundStatus: (roundId: string, status: 'open' | 'closed') => Promise<void>
}

const ProjectContext = createContext<ProjectContextValue | null>(null)

export function useProjectContext() {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProjectContext must be used within ProjectProvider')
  return ctx
}

export function ProjectProvider({ children, initial }: { children: ReactNode; initial: Project[] }) {
  const [projects, setProjects] = useState<Project[]>(initial)

  const updateStatus = useCallback(async (id: string, status: 'draft' | 'active' | 'closed') => {
    const prev = [...projects]
    setProjects(prevProjects =>
      prevProjects.map(p => p.id === id ? { ...p, status } : p)
    )
    try {
      await updateProjectStatus(id, status)
      toast.success('Project status updated')
    } catch {
      setProjects(prev)
      toast.error('Failed to update project status')
    }
  }, [projects])

  const addProject = useCallback((project: Project) => {
    setProjects(prev => [...prev, project])
  }, [])

  const addCasting = useCallback((projectId: string, casting: Casting) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, castings: [...p.castings, casting] } : p
    ))
  }, [])

  const addRound = useCallback((castingId: string, round: Round) => {
    setProjects(prev => prev.map(p => ({
      ...p,
      castings: p.castings.map(c =>
        c.id === castingId ? { ...c, rounds: [...c.rounds, round] } : c
      ),
    })))
  }, [])

  const updateRoundStatus = useCallback(async (roundId: string, status: 'open' | 'closed') => {
    const prev = [...projects]
    setProjects(prevProjects =>
      prevProjects.map(p => ({
        ...p,
        castings: p.castings.map(c => ({
          ...c,
          rounds: c.rounds.map(r => r.id === roundId ? { ...r, status } : r),
        })),
      }))
    )
    try {
      if (status === 'open') {
        await openRound(roundId)
        toast.success('Round opened')
      } else {
        await closeRound(roundId)
        toast.success('Round closed')
      }
    } catch {
      setProjects(prev)
      toast.error(`Failed to ${status === 'open' ? 'open' : 'close'} round`)
    }
  }, [projects])

  return (
    <ProjectContext.Provider value={{ projects, updateStatus, addProject, addCasting, addRound, updateRoundStatus }}>
      {children}
    </ProjectContext.Provider>
  )
}
