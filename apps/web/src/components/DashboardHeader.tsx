import { Search, LayoutList, LayoutGrid, Plus } from 'lucide-react'
import { useActorContext, type ViewMode } from '../context/ActorContext'

export function DashboardHeader({ onCreateClick }: { onCreateClick: () => void }) {
  const { searchQuery, setSearchQuery, viewMode, setViewMode } = useActorContext()

  return (
    <div className="dashboard-header">
      <div className="dashboard-header-left">
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search actors by name or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="dashboard-header-right">
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List view"
          >
            <LayoutList size={16} />
          </button>
          <button
            className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            <LayoutGrid size={16} />
          </button>
        </div>
        <button className="btn btn-primary" onClick={onCreateClick}>
          <Plus size={16} /> New Actor
        </button>
      </div>
    </div>
  )
}
