import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTeams } from '../hooks/useTeams'
import { useMyTeam } from '../context/MyTeamContext'
import Scorecard from '../components/Scorecard'
import HoleEntrySheet from '../components/HoleEntrySheet'
import ScoreBar from '../components/ScoreBar'
import NamePicker from '../components/NamePicker'
import { claimTeam, leaveTeam, setHoleScore, clearHoleScore } from '../data/firestoreApi'
import { netSummary } from '../data/scoring'
import './TeamView.css'

export default function TeamView() {
  const { teamId } = useParams()
  const navigate = useNavigate()
  const { teams, loading } = useTeams()
  const { myTeamId, setMyTeamId, setMyName } = useMyTeam()
  const [selectedHole, setSelectedHole] = useState(null)
  const [pickingName, setPickingName] = useState(false)

  const team = teams.find((t) => t.id === teamId)
  const isMine = myTeamId === teamId

  if (loading) return <div className="container">Loading…</div>
  if (!team) {
    return (
      <div className="container">
        <p>Team not found.</p>
        <Link to="/teams">Back to teams</Link>
      </div>
    )
  }

  const scores = team.scores || {}
  const summary = netSummary(scores, team.strokeAdvantage || 0)
  const canEdit = isMine

  const pickName = async (name) => {
    await claimTeam(team.id, name)
    setMyName(name)
    setMyTeamId(team.id)
    setPickingName(false)
  }

  // Stops scoring for this team: releases the scorekeeper role (a teammate
  // can then claim it on their own phone) and goes back to the team list.
  const leave = async () => {
    await leaveTeam(team.id)
    setMyTeamId(null)
    navigate('/')
  }

  return (
    <div className="container stack">
      <div className="page-title">
        <h1>Group {team.group}</h1>
        <Link className="btn btn-sm" to="/teams">
          All teams
        </Link>
      </div>
      <p className="muted">
        {team.teeTime} tee time · {team.players.join(', ')}
      </p>

      <ScoreBar
        thru={summary.thru}
        holesTotal={summary.holesTotal}
        toPar={summary.toPar}
        netToPar={summary.netToPar}
        strokeAdvantage={team.strokeAdvantage || 0}
      />

      {!canEdit && !pickingName && (
        <div className="card stack">
          {team.claimedBy ? (
            <p>
              <strong>{team.claimedBy.name}</strong> is scoring for this group. You're viewing live.
              If you have an issue with scoring, or you are having trouble reassigning the scorer, contact Brendan McCann.
            </p>
          ) : (
            <>
              <p>No one has picked up scoring for this group yet.</p>
              <button className="btn btn-primary btn-sm" onClick={() => setPickingName(true)}>
                That's me, I'll score
              </button>
            </>
          )}
        </div>
      )}

      {!canEdit && pickingName && (
        <div className="card stack">
          <p className="muted">Tap your name:</p>
          <NamePicker players={team.players} currentName={team.claimedBy?.name} onSelect={pickName} />
        </div>
      )}

      {canEdit && (
        <div className="card team-scoring-as">
          <span>Scoring as {team.claimedBy?.name}</span>
          <div className="team-scoring-actions">
            <button className="btn btn-sm btn-danger" onClick={leave}>
              Stop scoring
            </button>
          </div>
        </div>
      )}

      {canEdit && <p className="muted">Tap any hole to enter or change your team's score.</p>}

      <Scorecard scores={scores} onEditHole={canEdit ? setSelectedHole : undefined} />

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
