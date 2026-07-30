import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { toast } from 'sonner'
import { updateProjectStatus } from '../services/projectService'
import type { Project, Casting, Round } from '../data/mock'

interface ProjectContextValue {
  projects: Project[]
  updateStatus: (id: string, status: 'draft' | 'active' | 'closed') => Promise<void>
  addProject: (project: Project) => void
  addCasting: (projectId: string, casting: Casting) => void
  addRound: (castingId: string, round: Round) => void
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

  return (
    <ProjectContext.Provider value={{ projects, updateStatus, addProject, addCasting, addRound }}>
      {children}
    </ProjectContext.Provider>
  )
}
