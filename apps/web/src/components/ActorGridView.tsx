import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useActorContext } from '../context/ActorContext'

export function ActorGridView() {
  const { filtered, loading, currentPage, totalPages, setCurrentPage, selectActor } = useActorContext()

  if (loading) {
    return <div className="empty-state"><h3>Loading...</h3></div>
  }

  if (filtered.length === 0) {
    return (
      <div className="empty-state">
        <h3>No actors found</h3>
        <p>Try adjusting your search or filter.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="card-grid">
        {filtered.map((actor, i) => (
          <div
            key={actor.id}
            className={`card glass glass-hover animate-in animate-in-d${(i % 5) + 1}`}
            onClick={() => selectActor(actor)}
          >
            {actor.profilePictureUrl ? (
              <img
                src={actor.profilePictureUrl}
                alt={actor.name}
                className="card-avatar-img"
              />
            ) : (
              <div className="avatar" style={{ width: 48, height: 48, fontSize: 16 }}>
                {actor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <h3 className="card-title">{actor.name}</h3>
              <p className="card-sub">{actor.email}</p>
            </div>
            {actor.phone && <div className="card-meta"><span>📞 {actor.phone}</span></div>}
            <div className="card-meta">
              <span>Joined {new Date(actor.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`pagination-btn${page === currentPage ? ' active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="pagination-btn"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
