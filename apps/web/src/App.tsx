import { useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import { getProfile } from './services/profileService'
import { ProjectProvider } from './context/ProjectContext'
import { ProjectsView } from './views/ProjectsView'
import { ActorsView } from './views/ActorsView'
import { SettingsView } from './views/SettingsView'
import { DocsView } from './views/DocsView'
import { HelpView } from './views/HelpView'
import { createProject } from './services/projectService'
import { mockProjects } from './data/mock'
import type { CreateProjectInput } from './services/projectService'
import type { Project } from './data/mock'

const navItems = [
  { path: '/', label: 'Projects', icon: '🎬', match: ['/', '/projects', '/project', '/casting', '/round'] },
  { path: '/actors', label: 'Actors', icon: '👥', match: ['/actors'] },
  { path: '/docs', label: 'Docs', icon: '📖', match: ['/docs'] },
  { path: '/help', label: 'Help', icon: '❓', match: ['/help'] },
  { path: '/settings', label: 'Settings', icon: '⚙️', match: ['/settings'] },
]

function useActiveRoute() {
  return useLocation().pathname
}

export default function App() {
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const navigate = useNavigate()
  const path = useActiveRoute()
  const profile = getProfile()

  const isActive = (match: string[]) => match.some(m => path === m || path.startsWith(m + '/') || (m === '/' && path === '/projects'))

  async function handleProjectCreate(data: CreateProjectInput) {
    const res = await createProject(data).catch(() => null)
    const newProject: Project = {
      id: res?.id ?? `p${Date.now()}`,
      title: data.title,
      description: data.description,
      status: 'active',
      castings: [],
    }
    setProjects(prev => [...prev, newProject])
  }

  return (
    <div className="app-layout">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(20,20,30,0.95)',
            backdropFilter: 'blur(24px)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font)',
            fontSize: 14,
          },
        }}
      />
      <div className="bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <aside className="sidebar glass">
        <div className="logo">MasterAI</div>
        {navItems.map(item => (
          <button
            key={item.path}
            className={`nav-item${isActive(item.match) ? ' active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span>{item.icon}</span> {item.label}
          </button>
        ))}
      </aside>

      <main className="main-area">
        <header className="topbar glass">
          <h1 className="topbar-title">Director Dashboard</h1>
          <div className="topbar-right">
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{profile.name}</span>
            <div className="avatar">{profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
          </div>
        </header>
        <div className="content">
          <ProjectProvider initial={projects}>
            <Routes>
              <Route path="/actors" element={<ActorsView />} />
              <Route path="*" element={<ProjectsView projects={projects} onProjectClick={(id) => navigate(`/project/${id}`)} onProjectCreate={handleProjectCreate} />} />
            </Routes>
          </ProjectProvider>
        </div>
      </main>
    </div>
  )
}
