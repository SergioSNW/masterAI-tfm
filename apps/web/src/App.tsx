import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom'
import { Toaster, toast } from 'sonner'
import { getProfile } from './services/profileService'
import { ProjectProvider, useProjectContext } from './context/ProjectContext'
import { ProjectsView } from './views/ProjectsView'
import { ActorsView } from './views/ActorsView'
import { SettingsView } from './views/SettingsView'
import { DocsView } from './views/DocsView'
import { HelpView } from './views/HelpView'
import { ProjectDetailView } from './views/ProjectDetailView'
import { CastingDetailView } from './views/CastingDetailView'
import { RoundDetailView } from './views/RoundDetailView'
import { PersonaSelector } from './views/PersonaSelector'
import { ActorPortalView } from './views/ActorPortalView'
import { createProject, fetchDashboard } from './services/projectService'
import type { CreateProjectInput } from './services/projectService'
import { createCasting } from './services/castingService'
import { createRound } from './services/roundService'
import type { Project, Casting, Round } from './data/mock'

/* ── Route Wrappers ── */

function ProjectsRoute() {
  const navigate = useNavigate()
  const { projects, addProject } = useProjectContext()

  async function handleCreate(data: CreateProjectInput) {
    const res = await createProject(data).catch(() => null)
    addProject({
      id: res?.id ?? `p${Date.now()}`,
      title: data.title,
      description: data.description,
      status: 'active',
      castings: [],
    })
  }

  return (
    <ProjectsView
      projects={projects}
      onProjectClick={(id) => navigate(`/project/${id}`)}
      onProjectCreate={handleCreate}
    />
  )
}

function ProjectDetailRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { projects, addCasting } = useProjectContext()

  const project = projects.find(p => p.id === id)
  if (!project) return <Navigate to="/projects" />

  async function handleCastingCreate(projectId: string, casting: Casting) {
    try {
      const res = await createCasting({
        projectId,
        roleName: casting.roleName,
        description: casting.description,
        requirements: casting.requirements,
      })
      addCasting(projectId, {
        id: res.id,
        projectId,
        roleName: res.roleName,
        description: res.description,
        requirements: res.requirements,
        status: res.status as Casting['status'],
        rounds: [],
      })
      toast.success('Casting created')
    } catch {
      toast.error('Failed to create casting')
    }
  }

  return (
    <ProjectDetailView
      project={project}
      onBack={() => navigate('/projects')}
      onCastingClick={(castingId) => navigate(`/casting/${castingId}`)}
      onCastingCreate={handleCastingCreate}
    />
  )
}

function CastingDetailRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { projects, addRound } = useProjectContext()

  let casting: Casting | undefined
  let parentProjectId: string | undefined
  for (const p of projects) {
    const c = p.castings.find(c => c.id === id)
    if (c) { casting = c; parentProjectId = p.id; break }
  }

  if (!casting) return <Navigate to="/projects" />

  async function handleRoundCreate(castingId: string, round: Round) {
    try {
      const res = await createRound({
        castingId,
        name: round.name,
        description: round.description,
        deadline: round.deadline,
        order: round.order,
      })
      addRound(castingId, {
        id: res.id,
        castingId,
        name: res.name,
        description: res.description,
        deadline: res.deadline,
        order: res.order,
        status: res.status as Round['status'],
        submissions: [],
      })
      toast.success('Round created')
    } catch {
      toast.error('Failed to create round')
    }
  }

  return (
    <CastingDetailView
      casting={casting}
      onBack={() => navigate(`/project/${parentProjectId}`)}
      onRoundClick={(roundId) => navigate(`/round/${roundId}`)}
      onRoundCreate={handleRoundCreate}
    />
  )
}

function RoundDetailRoute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { projects } = useProjectContext()

  let round: Round | undefined
  let parentCastingId: string | undefined
  for (const p of projects) {
    for (const c of p.castings) {
      const r = c.rounds.find(r => r.id === id)
      if (r) { round = r; parentCastingId = c.id; break }
    }
    if (round) break
  }

  if (!round) return <Navigate to="/projects" />

  return (
    <RoundDetailView
      round={round}
      onBack={() => navigate(`/casting/${parentCastingId}`)}
    />
  )
}

/* ── Nav config ── */

const navItems = [
  { path: '/projects', label: 'Projects', icon: '🎬', match: ['/', '/projects', '/project', '/casting', '/round'] },
  { path: '/actors', label: 'Actors', icon: '👥', match: ['/actors'] },
  { path: '/docs', label: 'Docs', icon: '📖', match: ['/docs'] },
  { path: '/help', label: 'Help', icon: '❓', match: ['/help'] },
  { path: '/settings', label: 'Settings', icon: '⚙️', match: ['/settings'] },
]

function useActiveRoute() {
  return useLocation().pathname
}

export default function App() {
  const navigate = useNavigate()
  const path = useActiveRoute()
  const profile = getProfile()
  const isSelector = path === '/'
  const isActor = path === '/actor' || path.startsWith('/actor/')
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboard()
      .then(setProjects)
      .catch((err: unknown) => {
        setLoadError(err instanceof Error ? err.message : 'Failed to load dashboard')
        setProjects([])
      })
  }, [])

  const isActive = (match: string[]) => match.some(m => path === m || path.startsWith(m + '/') || (m === '/' && path === '/projects'))

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

      {isSelector ? (
        <PersonaSelector
          onDirector={() => navigate('/projects')}
          onActor={() => navigate('/actor')}
        />
      ) : isActor ? (
        <>
          <aside className="sidebar glass">
            <div className="logo">MasterAI</div>
            <div style={{ padding: '10px 12px', fontSize: 13, color: 'var(--text-tertiary)' }}>🎭 Actor</div>
          </aside>
          <main className="main-area">
            <header className="topbar glass">
              <h1 className="topbar-title">Actor Portal</h1>
              <div className="topbar-right">
                <button className="btn btn-ghost switch-role-btn" onClick={() => navigate('/')}>
                  Switch Role
                </button>
              </div>
            </header>
            <div className="content">
              <Routes>
                <Route path="/actor" element={<ActorPortalView />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </main>
        </>
      ) : (
        <>
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
                <button className="btn btn-ghost switch-role-btn" onClick={() => navigate('/')}>
                  Switch Role
                </button>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{profile.name}</span>
                <div className="avatar">{profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
              </div>
            </header>
            <div className="content">
              {projects ? (
                <ProjectProvider initial={projects}>
                  <Routes>
                    <Route path="/projects" element={<ProjectsRoute />} />
                    <Route path="/project/:id" element={<ProjectDetailRoute />} />
                    <Route path="/casting/:id" element={<CastingDetailRoute />} />
                    <Route path="/round/:id" element={<RoundDetailRoute />} />
                    <Route path="/actors" element={<ActorsView />} />
                    <Route path="/docs" element={<DocsView />} />
                    <Route path="/help" element={<HelpView />} />
                    <Route path="/settings" element={<SettingsView />} />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </ProjectProvider>
              ) : (
                <div className="empty-state" style={{ padding: '80px 20px' }}>
                  <h3>{loadError ? 'Failed to load dashboard' : 'Loading dashboard...'}</h3>
                  {loadError && <p>{loadError}</p>}
                </div>
              )}
            </div>
          </main>
        </>
      )}
    </div>
  )
}
