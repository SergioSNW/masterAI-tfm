import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { toast } from 'sonner'
import { updateProjectStatus } from '../services/projectService'
import type { Project } from '../data/mock'

interface ProjectContextValue {
  projects: Project[]
  updateStatus: (id: string, status: 'draft' | 'active' | 'closed') => Promise<void>
  addProject: (project: Project) => void
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

  return (
    <ProjectContext.Provider value={{ projects, updateStatus, addProject }}>
      {children}
    </ProjectContext.Provider>
  )
}
