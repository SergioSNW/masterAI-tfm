import { useActorContext } from '../context/ActorContext'

export function ActorListView() {
  const { filtered, loading, selectActor } = useActorContext()

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
            <th>Joined</th>
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
              <td className="actor-cell-muted">{new Date(actor.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
