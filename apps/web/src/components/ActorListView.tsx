import { useState } from 'react'
import { MoreHorizontal, Edit2, Trash2 } from 'lucide-react'
import { useActorContext } from '../context/ActorContext'

const STAGES = ['Pending', 'First Round', 'Callback', 'Casted']

export function ActorListView() {
  const { filtered, loading, selectActor, updateActor, deleteActor } = useActorContext()
  const [openMenu, setOpenMenu] = useState<string | null>(null)

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
    <div className="actor-table-wrapper glass">
      <table className="actor-table">
        <thead>
          <tr>
            <th>Actor</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Stage</th>
            <th>Joined</th>
            <th style={{ width: 40 }}></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(actor => (
            <tr key={actor.id} className="actor-row" onClick={() => selectActor(actor)}>
              <td>
                <div className="actor-cell-name">
                  <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                    {actor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <span>{actor.name}</span>
                </div>
              </td>
              <td className="actor-cell-muted">{actor.email}</td>
              <td className="actor-cell-muted">{actor.phone ?? '—'}</td>
              <td>
                <span className={`stage-badge stage-${(actor.castingStage ?? 'Pending').toLowerCase().replace(/\s+/g, '-')}`}>
                  {actor.castingStage ?? 'Pending'}
                </span>
              </td>
              <td className="actor-cell-muted">{new Date(actor.createdAt).toLocaleDateString()}</td>
              <td onClick={e => e.stopPropagation()}>
                <div className="action-menu-wrapper">
                  <button className="action-menu-trigger" onClick={() => setOpenMenu(openMenu === actor.id ? null : actor.id)}>
                    <MoreHorizontal size={16} />
                  </button>
                  {openMenu === actor.id && (
                    <div className="action-menu-dropdown">
                      <div className="action-menu-section">
                        <span className="action-menu-label">Casting Stage</span>
                        {STAGES.map(stage => (
                          <button
                            key={stage}
                            className="action-menu-item"
                            onClick={() => {
                              updateActor({ id: actor.id, castingStage: stage })
                              setOpenMenu(null)
                            }}
                          >
                            <span className={`stage-dot stage-${stage.toLowerCase().replace(/\s+/g, '-')}`} />
                            {stage}
                          </button>
                        ))}
                      </div>
                      <div className="action-menu-divider" />
                      <button className="action-menu-item" onClick={() => { selectActor(actor, 'edit'); setOpenMenu(null) }}>
                        <Edit2 size={14} /> Edit
                      </button>
                      <button className="action-menu-item danger" onClick={() => {
                        setOpenMenu(null)
                        if (window.confirm('Are you sure you want to delete this actor?')) {
                          deleteActor(actor.id)
                        }
                      }}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
