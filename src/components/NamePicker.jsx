import './NamePicker.css'

// Tap-your-name picker used to claim an unclaimed team as scorekeeper.
// `currentName`, if given, gets a checkmark so people can see who currently
// holds the role.
export default function NamePicker({ players, currentName, onSelect }) {
  return (
    <div className="name-picker">
      {players.map((name) => {
        const isCurrent = name === currentName
        return (
          <button
            key={name}
            className={`name-picker-option ${isCurrent ? 'name-picker-current' : ''}`}
            onClick={() => onSelect(name)}
          >
            {name}
            {isCurrent && <span className="name-picker-check">✓</span>}
          </button>
        )
      })}
    </div>
  )
}
