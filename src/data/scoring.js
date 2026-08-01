import { HOLES, TOTAL_PAR } from './course'

export function scoreLabel(strokes, par) {
  if (strokes == null) return null
  const diff = strokes - par
  if (diff <= -2) return 'eagle'
  if (diff === -1) return 'birdie'
  if (diff === 0) return 'par'
  return 'bogey' // capped at +1 by tournament rules
}

export const LABEL_TEXT = {
  eagle: 'Eagle',
  birdie: 'Birdie',
  par: 'Par',
  bogey: 'Bogey',
}

// Summarize a team's raw { "1": strokes, ... } score map against the card.
export function summarizeScores(scores = {}) {
  let gross = 0
  let parPlayed = 0
  let thru = 0

  for (const h of HOLES) {
    const strokes = scores[h.hole]
    if (strokes == null) continue
    thru += 1
    gross += strokes
    parPlayed += h.par
  }

  const toPar = gross - parPlayed
  return { gross, parPlayed, thru, toPar, holesTotal: HOLES.length, totalPar: TOTAL_PAR }
}

export function formatToPar(toPar) {
  if (toPar === 0) return 'E'
  return toPar > 0 ? `+${toPar}` : `${toPar}`
}

// Net = gross strokes minus the team's stroke advantage (Group 6 = -3).
export function netSummary(scores, strokeAdvantage = 0) {
  const s = summarizeScores(scores)
  const net = s.gross - strokeAdvantage
  const netToPar = s.toPar - strokeAdvantage
  return { ...s, net, netToPar }
}
