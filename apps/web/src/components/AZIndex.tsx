import { useActorContext } from '../context/ActorContext'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export function AZIndex() {
  const { activeLetter, setActiveLetter } = useActorContext()

  return (
    <div className="az-index">
      <button
        className={`az-letter${activeLetter === null ? ' active' : ''}`}
        onClick={() => setActiveLetter(null)}
      >
        All
      </button>
      {LETTERS.map(letter => (
        <button
          key={letter}
          className={`az-letter${activeLetter === letter ? ' active' : ''}`}
          onClick={() => setActiveLetter(activeLetter === letter ? null : letter)}
        >
          {letter}
        </button>
      ))}
    </div>
  )
}
