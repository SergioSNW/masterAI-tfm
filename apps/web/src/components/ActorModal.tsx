import { X, Mail, Phone, Calendar, FileText } from 'lucide-react'
import { useActorContext } from '../context/ActorContext'

export function ActorModal() {
  const { selectedActor, closeModal } = useActorContext()
  if (!selectedActor) return null

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content glass-strong" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={closeModal}>
          <X size={18} />
        </button>

        <div className="modal-header">
          {selectedActor.profilePictureUrl ? (
            <img
              src={selectedActor.profilePictureUrl}
              alt={selectedActor.name}
              className="modal-avatar-img"
            />
          ) : (
            <div className="avatar" style={{ width: 64, height: 64, fontSize: 22 }}>
              {selectedActor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
          )}
          <div>
            <h2 className="modal-title">{selectedActor.name}</h2>
            <p className="modal-sub">{selectedActor.email}</p>
          </div>
        </div>

        <div className="modal-body">
          <div className="modal-info-row">
            <Mail size={16} />
            <span>{selectedActor.email}</span>
          </div>
          {selectedActor.phone && (
            <div className="modal-info-row">
              <Phone size={16} />
              <span>{selectedActor.phone}</span>
            </div>
          )}
          <div className="modal-info-row">
            <Calendar size={16} />
            <span>Joined {new Date(selectedActor.createdAt).toLocaleDateString()}</span>
          </div>
          {selectedActor.bio && (
            <div className="modal-info-row" style={{ alignItems: 'flex-start' }}>
              <FileText size={16} style={{ marginTop: 2 }} />
              <span>{selectedActor.bio}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
