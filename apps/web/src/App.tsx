import { useState } from 'react'
import { useHashRoute } from './hooks/useHashRoute'
import { mockProjects } from './data/mock'
import { ProjectsView } from './views/ProjectsView'
import { ProjectDetailView } from './views/ProjectDetailView'
import { CastingDetailView } from './views/CastingDetailView'
import { RoundDetailView } from './views/RoundDetailView'
import { ActorsView } from './views/ActorsView'
import { SettingsView } from './views/SettingsView'
import { createProject } from './services/projectService'
import { getProfile } from './services/profileService'
import type { CreateProjectInput } from './services/projectService'
import type { Project } from './data/mock'

export default function App() {
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const { route, navigate } = useHashRoute()

  const parts = route.split('/')
  const view = parts[0]

  const project = view === 'project' ? projects.find(p => p.id === parts[1]) : null
  const casting = view === 'casting' ? projects.flatMap(p => p.castings).find(c => c.id === parts[1]) : null
  const round = view === 'round' ? projects.flatMap(p => p.castings.flatMap(c => c.rounds)).find(r => r.id === parts[1]) : null

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

  function renderView() {
    switch (view) {
      case 'project':
        return project
          ? <ProjectDetailView project={project} onBack={() => navigate('projects')} onCastingClick={(id) => navigate(`casting/${id}`)} />
          : <EmptyState />
      case 'casting':
        return casting
          ? <CastingDetailView casting={casting} onBack={() => navigate(`project/${casting.projectId}`)} onRoundClick={(id) => navigate(`round/${id}`)} />
          : <EmptyState />
      case 'round':
        return round
          ? <RoundDetailView round={round} onBack={() => navigate(`casting/${round.castingId}`)} onReview={(subId, status, feedback) => {
              setProjects(prev => prev.map(p => ({
                ...p,
                castings: p.castings.map(c => ({
                  ...c,
                  rounds: c.rounds.map(r => ({
                    ...r,
                    submissions: r.submissions.map(s => s.id === subId ? { ...s, status, feedback: feedback || s.feedback } : s),
                  })),
                })),
              })))
            }} />
          : <EmptyState />
      case 'actors':
        return <ActorsView />
      case 'settings':
        return <SettingsView />
      default:
        return <ProjectsView projects={projects} onProjectClick={(id) => navigate(`project/${id}`)} onProjectCreate={handleProjectCreate} />
    }
  }

  return (
    <div className="app-layout">
      <div className="bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <aside className="sidebar glass">
        <div className="logo">MasterAI</div>
        <button className={`nav-item ${view === 'projects' || view === '' || view === 'project' || view === 'casting' || view === 'round' ? 'active' : ''}`} onClick={() => navigate('projects')}>
          <span>🎬</span> Projects
        </button>
        <button className={`nav-item ${view === 'actors' ? 'active' : ''}`} onClick={() => navigate('actors')}>
          <span>👥</span> Actors
        </button>
        <button className={`nav-item ${view === 'settings' ? 'active' : ''}`} onClick={() => navigate('settings')}>
          <span>⚙️</span> Settings
        </button>
      </aside>

      <main className="main-area">
        <header className="topbar glass">
          <h1 className="topbar-title">Director Dashboard</h1>
          <div className="topbar-right">
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{getProfile().name}</span>
            <div className="avatar">{getProfile().name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
          </div>
        </header>
        <div className="content">
          {renderView()}
        </div>
      </main>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="empty-state">
      <h3>Not Found</h3>
      <p>The requested page could not be found.</p>
    </div>
  )
}
