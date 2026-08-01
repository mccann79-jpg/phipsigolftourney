import { LABEL_TEXT, scoreLabel } from '../data/scoring'
import './HoleEntrySheet.css'

// Bottom sheet for picking a hole's score. Options run from 3-under par up
// to bogey (par + 1) — bogey is the hard cap per tournament rules, and a
// score can never be below 1 stroke.
function scoreOptions(par) {
  const min = Math.max(1, par - 3)
  const max = par + 1
  const opts = []
  for (let s = min; s <= max; s++) opts.push(s)
  return opts
}

export default function HoleEntrySheet({ hole, currentScore, onSelect, onClear, onClose }) {
  if (!hole) return null
  const options = scoreOptions(hole.par)

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-header">
          <h3>
            Hole {hole.hole} <span className="muted">· Par {hole.par} · {hole.yardage} yds</span>
          </h3>
          <button className="btn btn-sm" onClick={onClose}>
            Done
          </button>
        </div>
        <div className="sheet-options">
          {options.map((s) => {
            const label = scoreLabel(s, hole.par)
            const selected = s === currentScore
            return (
              <button
                key={s}
                className={`sheet-option sc-${label} ${selected ? 'sheet-option-selected' : ''}`}
                onClick={() => onSelect(s)}
              >
                <span className="sheet-option-num">{s}</span>
                <span className="sheet-option-label">{LABEL_TEXT[label]}</span>
              </button>
            )
          })}
        </div>
        {currentScore != null && (
          <button className="btn btn-sm sheet-clear" onClick={onClear}>
            Clear score
          </button>
        )}
      </div>
    </div>
  )
}
