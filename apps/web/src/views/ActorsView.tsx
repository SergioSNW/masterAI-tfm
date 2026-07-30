import { useState } from 'react'
import { ActorProvider, useActorContext } from '../context/ActorContext'
import { DashboardHeader } from '../components/DashboardHeader'
import { AZIndex } from '../components/AZIndex'
import { ActorListView } from '../components/ActorListView'
import { ActorGridView } from '../components/ActorGridView'
import { ActorModal } from '../components/ActorModal'
import { CreateActorModal } from '../components/CreateActorModal'
import type { CreateActorInput } from '../services/actorService'

function ActorsContent() {
  const { viewMode, actors, createActor } = useActorContext()
  const [showCreate, setShowCreate] = useState(false)

  async function handleCreate(data: CreateActorInput) {
    await createActor(data)
    setShowCreate(false)
  }

  return (
    <div>
      <div className="detail-header">
        <div className="detail-header-left">
          <h1>Actors</h1>
          <p>{actors.length} registered actors</p>
        </div>
      </div>

      <DashboardHeader onCreateClick={() => setShowCreate(true)} />
      <AZIndex />

      {viewMode === 'list' ? <ActorListView /> : <ActorGridView />}

      <ActorModal />

      {showCreate && (
        <CreateActorModal
          onSubmit={handleCreate}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  )
}

export function ActorsView() {
  return (
    <ActorProvider>
      <ActorsContent />
    </ActorProvider>
  )
}
