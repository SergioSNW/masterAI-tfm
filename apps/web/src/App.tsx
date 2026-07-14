import { useHashRoute } from './hooks/useHashRoute'
import { mockProjects } from './data/mock'
import { ProjectsView } from './views/ProjectsView'
import { ProjectDetailView } from './views/ProjectDetailView'
import { CastingDetailView } from './views/CastingDetailView'
import { RoundDetailView } from './views/RoundDetailView'
import { ActorsView } from './views/ActorsView'

export default function App() {
  const { route, navigate } = useHashRoute()

  const parts = route.split('/')
  const view = parts[0]

  const project = view === 'project' ? mockProjects.find(p => p.id === parts[1]) : null
  const casting = view === 'casting' ? mockProjects.flatMap(p => p.castings).find(c => c.id === parts[1]) : null
  const round = view === 'round' ? mockProjects.flatMap(p => p.castings.flatMap(c => c.rounds)).find(r => r.id === parts[1]) : null

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
          ? <RoundDetailView round={round} onBack={() => navigate(`casting/${round.castingId}`)} />
          : <EmptyState />
      case 'actors':
        return <ActorsView />
      default:
        return <ProjectsView projects={mockProjects} onProjectClick={(id) => navigate(`project/${id}`)} />
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
        <button className={`nav-item ${view === 'projects' ? 'active' : ''}`} onClick={() => navigate('projects')}>
          <span>🎬</span> Projects
        </button>
        <button className={`nav-item ${view === 'actors' ? 'active' : ''}`} onClick={() => navigate('actors')}>
          <span>👥</span> Actors
        </button>
        <button className="nav-item">
          <span>⚙️</span> Settings
        </button>
      </aside>

      <main className="main-area">
        <header className="topbar glass">
          <h1 className="topbar-title">Director Dashboard</h1>
          <div className="topbar-right">
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Sarah Connor</span>
            <div className="avatar">SC</div>
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
