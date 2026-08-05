interface Props {
  onDirector: () => void
  onActor: () => void
}

export function PersonaSelector({ onDirector, onActor }: Props) {
  return (
    <div className="persona-shell">
      <div className="logo persona-logo">MasterAI</div>
      <h1 className="persona-title">Who are you?</h1>
      <p className="persona-sub">Choose how you want to continue</p>

      <div className="persona-grid">
        <button className="persona-card glass glass-hover" onClick={onDirector}>
          <span className="persona-icon">🎬</span>
          <span className="persona-name">Enter as Director</span>
          <span className="persona-desc">Manage projects, castings, and review actor submissions</span>
        </button>

        <button className="persona-card glass glass-hover" onClick={onActor}>
          <span className="persona-icon">🎭</span>
          <span className="persona-name">Enter as Actor</span>
          <span className="persona-desc">Browse open castings and track your auditions</span>
        </button>
      </div>
    </div>
  )
}
