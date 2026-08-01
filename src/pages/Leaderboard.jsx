import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTeams } from '../hooks/useTeams'
import { useMyTeam } from '../context/MyTeamContext'
import Scorecard from '../components/Scorecard'
import { netSummary, formatToPar } from '../data/scoring'
import { HOLES } from '../data/course'
import './Leaderboard.css'

function rank(teams) {
  const withSummary = teams.map((t) => ({
    team: t,
    summary: netSummary(t.scores || {}, t.strokeAdvantage || 0),
  }))
  withSummary.sort((a, b) => {
    if (a.summary.thru === 0 && b.summary.thru === 0) return a.team.group - b.team.group
    if (a.summary.thru === 0) return 1
    if (b.summary.thru === 0) return -1
    if (a.summary.netToPar !== b.summary.netToPar) return a.summary.netToPar - b.summary.netToPar
    return b.summary.thru - a.summary.thru
  })
  return withSummary
}

export default function Leaderboard() {
  const { teams, loading, error } = useTeams()
  const { myTeamId } = useMyTeam()
  const [expanded, setExpanded] = useState(null)
  const ranked = useMemo(() => rank(teams), [teams])

  return (
    <div className="container stack">
      <h1>Leaderboard</h1>
      <p className="muted">
        Ranked by net score to par ({HOLES.length} holes, bogey-max scoring). Group 6 plays with a
        3-stroke advantage.
      </p>

      {loading && <p className="muted">Loading…</p>}
      {error && error !== 'not-configured' && <p className="muted">Couldn't load leaderboard.</p>}

      {!loading && ranked.length > 0 && (
        <div className="card leaderboard-table">
          <div className="lb-row lb-head">
            <span className="lb-pos">#</span>
            <span className="lb-team">Team</span>
            <span className="lb-thru">Thru</span>
            <span className="lb-score">Score</span>
            <span className="lb-net">Net</span>
          </div>
          {ranked.map(({ team, summary }, i) => {
            const isOpen = expanded === team.id
            const started = summary.thru > 0
            const complete = summary.thru === summary.holesTotal
            const isMine = team.id === myTeamId
            return (
              <div key={team.id} className="lb-group">
                <button
                  className={`lb-row lb-row-btn ${isMine ? 'lb-row-mine' : ''}`}
                  onClick={() => setExpanded(isOpen ? null : team.id)}
                >
                  <span className="lb-pos">{started ? i + 1 : '—'}</span>
                  <span className="lb-team">
                    Group {team.group}
                    {team.strokeAdvantage > 0 && <span className="badge badge-gold">+{team.strokeAdvantage}</span>}
                    <span className="lb-players muted">{team.players.join(', ')}</span>
                  </span>
                  <span className="lb-thru">{started ? (complete ? 'F' : summary.thru) : '-'}</span>
                  <span className="lb-score">{started ? formatToPar(summary.toPar) : '-'}</span>
                  <span className="lb-net">{started ? formatToPar(summary.netToPar) : '-'}</span>
                </button>
                {isOpen && (
                  <div className="lb-detail">
                    <Scorecard scores={team.scores || {}} />
                    <Link className="btn btn-sm" to={`/team/${team.id}`}>
                      Open scorecard
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
