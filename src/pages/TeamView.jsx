import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTeams } from '../hooks/useTeams'
import { useMyTeam } from '../context/MyTeamContext'
import Scorecard from '../components/Scorecard'
import HoleEntrySheet from '../components/HoleEntrySheet'
import ScoreBar from '../components/ScoreBar'
import { claimTeam, setHoleScore, clearHoleScore } from '../data/firestoreApi'
import { netSummary } from '../data/scoring'
import './Home.css'

export default function TeamView() {
  const { teamId } = useParams()
  const navigate = useNavigate()
  const { teams, loading } = useTeams()
  const { myTeamId, myName, setMyTeamId, setMyName } = useMyTeam()
  const [selectedHole, setSelectedHole] = useState(null)
  const [claiming, setClaiming] = useState(false)
  const [nameInput, setNameInput] = useState(myName)

  const team = teams.find((t) => t.id === teamId)
  const isMine = myTeamId === teamId

  if (loading) return <div className="container">Loading…</div>
  if (!team) {
    return (
      <div className="container">
        <p>Team not found.</p>
        <Link to="/">Back to teams</Link>
      </div>
    )
  }

  const scores = team.scores || {}
  const summary = netSummary(scores, team.strokeAdvantage || 0)
  const canEdit = isMine

  const claimAndEdit = async (e) => {
    e.preventDefault()
    const trimmed = nameInput.trim()
    if (!trimmed) return
    await claimTeam(team.id, trimmed)
    setMyName(trimmed)
    setMyTeamId(team.id)
    setClaiming(false)
  }

  return (
    <div className="container stack">
      <div className="page-title">
        <h1>Group {team.group}</h1>
        <Link className="btn btn-sm" to="/leaderboard">
          Leaderboard
        </Link>
      </div>
      <p className="muted">{team.teeTime} tee time · {team.players.join(', ')}</p>

      <ScoreBar
        thru={summary.thru}
        holesTotal={summary.holesTotal}
        toPar={summary.toPar}
        netToPar={summary.netToPar}
        strokeAdvantage={team.strokeAdvantage || 0}
      />

      {!canEdit && (
        <div className="card">
          {team.claimedBy ? (
            <p>
              <strong>{team.claimedBy.name}</strong> is tracking scores for this group on their
              phone. You're viewing live.
            </p>
          ) : (
            <p>No one has claimed this group yet.</p>
          )}
          {!claiming && (
            <button className="btn btn-primary btn-sm" onClick={() => setClaiming(true)}>
              {team.claimedBy ? 'Take over scoring' : 'Score for this team'}
            </button>
          )}
          {claiming && (
            <form className="claim-form" onSubmit={claimAndEdit}>
              <input
                type="text"
                placeholder="Your name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                autoFocus
              />
              <button className="btn btn-primary btn-sm" type="submit" disabled={!nameInput.trim()}>
                Confirm
              </button>
            </form>
          )}
        </div>
      )}

      {canEdit && <p className="muted">Tap any hole to enter or change your team's score.</p>}

      <Scorecard scores={scores} onEditHole={canEdit ? setSelectedHole : undefined} />

      {canEdit && (
        <button
          className="btn btn-sm"
          onClick={() => {
            setMyTeamId(null)
            navigate('/')
          }}
        >
          Done scoring / switch team
        </button>
      )}

      {selectedHole && (
        <HoleEntrySheet
          hole={selectedHole}
          currentScore={scores[selectedHole.hole]}
          onSelect={async (strokes) => {
            await setHoleScore(team.id, selectedHole.hole, strokes)
            setSelectedHole(null)
          }}
          onClear={async () => {
            await clearHoleScore(team.id, selectedHole.hole)
            setSelectedHole(null)
          }}
          onClose={() => setSelectedHole(null)}
        />
      )}
    </div>
  )
}
