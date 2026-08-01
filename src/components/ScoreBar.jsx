import { formatToPar } from '../data/scoring'
import './ScoreBar.css'

// A dark, high-contrast "total score" strip, styled after the black score
// bar on GPS/GHIN scoring apps players already know from the course.
export default function ScoreBar({ thru, holesTotal, toPar, netToPar, strokeAdvantage }) {
  const started = thru > 0
  const complete = thru === holesTotal

  return (
    <div className="score-bar">
      <div className="score-bar-cell">
        <span className="score-bar-value">{started ? formatToPar(toPar) : '—'}</span>
        <span className="score-bar-label">To Par</span>
      </div>
      <div className="score-bar-sep" />
      <div className="score-bar-cell">
        <span className="score-bar-value">{started ? (complete ? 'F' : thru) : '—'}</span>
        <span className="score-bar-label">Thru</span>
      </div>
      {strokeAdvantage > 0 && (
        <>
          <div className="score-bar-sep" />
          <div className="score-bar-cell score-bar-cell-net">
            <span className="score-bar-value">{started ? formatToPar(netToPar) : '—'}</span>
            <span className="score-bar-label">Net (-{strokeAdvantage})</span>
          </div>
        </>
      )}
    </div>
  )
}
