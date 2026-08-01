import { FRONT_9, BACK_9, OUT_PAR, IN_PAR, TOTAL_PAR } from '../data/course'
import { scoreLabel } from '../data/scoring'
import './Scorecard.css'

function sum(holes, scores) {
  return holes.reduce((s, h) => (scores[h.hole] != null ? s + scores[h.hole] : s), 0)
}

function played(holes, scores) {
  return holes.some((h) => scores[h.hole] != null)
}

function ScoreCell({ hole, scores, onEdit, editable }) {
  const strokes = scores[hole.hole]
  const label = scoreLabel(strokes, hole.par)
  return (
    <td
      className={`sc-score-cell ${label ? `sc-${label}` : ''} ${editable ? 'sc-editable' : ''}`}
      onClick={editable ? () => onEdit(hole) : undefined}
    >
      <span className="sc-score-value">{strokes ?? ''}</span>
    </td>
  )
}

function Nine({ title, holes, outPar, scores, onEdit, editable }) {
  return (
    <table className="scorecard-table">
      <thead>
        <tr className="sc-row-hole">
          <th className="sc-label-col">{title}</th>
          {holes.map((h) => (
            <th key={h.hole}>{h.hole}</th>
          ))}
          <th className="sc-total-col">{title === 'OUT' ? 'OUT' : 'IN'}</th>
        </tr>
      </thead>
      <tbody>
        <tr className="sc-row-par">
          <td className="sc-label-col">Par</td>
          {holes.map((h) => (
            <td key={h.hole}>{h.par}</td>
          ))}
          <td className="sc-total-col">{outPar}</td>
        </tr>
        <tr className="sc-row-yardage">
          <td className="sc-label-col">Blue</td>
          {holes.map((h) => (
            <td key={h.hole}>{h.yardage}</td>
          ))}
          <td className="sc-total-col">{holes.reduce((s, h) => s + h.yardage, 0)}</td>
        </tr>
        <tr className="sc-row-score">
          <td className="sc-label-col">Score</td>
          {holes.map((h) => (
            <ScoreCell key={h.hole} hole={h} scores={scores} onEdit={onEdit} editable={editable} />
          ))}
          <td className="sc-total-col sc-total-score">{played(holes, scores) ? sum(holes, scores) : ''}</td>
        </tr>
      </tbody>
    </table>
  )
}

// Read-only or editable (pass onEditHole) embedded scorecard, styled after
// the club's own card, with birdie/par/bogey/eagle color-coding.
export default function Scorecard({ scores = {}, onEditHole }) {
  const editable = Boolean(onEditHole)
  const totalScore = played([...FRONT_9, ...BACK_9], scores) ? sum([...FRONT_9, ...BACK_9], scores) : null

  return (
    <div className="scorecard-wrap">
      <div className="scorecard-scroll">
        <Nine title="OUT" holes={FRONT_9} outPar={OUT_PAR} scores={scores} onEdit={onEditHole} editable={editable} />
      </div>
      <div className="scorecard-scroll">
        <Nine title="IN" holes={BACK_9} outPar={IN_PAR} scores={scores} onEdit={onEditHole} editable={editable} />
      </div>
      <div className="scorecard-total">
        <span>Total Par {TOTAL_PAR}</span>
        {totalScore != null && <span className="scorecard-total-score">Total {totalScore}</span>}
      </div>
      <div className="scorecard-legend">
        <span className="sc-legend-item"><i className="sc-swatch sc-eagle" />Eagle</span>
        <span className="sc-legend-item"><i className="sc-swatch sc-birdie" />Birdie</span>
        <span className="sc-legend-item"><i className="sc-swatch sc-par" />Par</span>
        <span className="sc-legend-item"><i className="sc-swatch sc-bogey" />Bogey (max)</span>
      </div>
    </div>
  )
}
