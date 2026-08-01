import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTeams } from '../hooks/useTeams'
import { useMyTeam } from '../context/MyTeamContext'
import { useAuthUid } from '../hooks/useAuthUid'
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
  const uid = useAuthUid()
  const [selectedHole, setSelectedHole] = useState(null)
  const [pickingName, setPickingName] = useState(false)
  const [claimError, setClaimError] = useState('')

  const team = teams.find((t) => t.id === teamId)
  const isMyTeam = myTeamId === teamId
  // Scorekeeper status is server truth (`claimedByUid` vs this session's
  // uid), not the "my team" preference — someone can follow a team without
  // ever being its scorekeeper, and vice versa on a different device.
  const canEdit = Boolean(uid) && team?.claimedByUid === uid
  const myScorekeeperTeam = uid ? teams.find((t) => t.claimedByUid === uid) : null
  const scorekeeperElsewhere = myScorekeeperTeam && myScorekeeperTeam.id !== teamId ? myScorekeeperTeam : null

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

  const pickName = async (name) => {
    setClaimError('')
    try {
      await claimTeam(team.id, name)
      setMyName(name)
      setMyTeamId(team.id)
      setPickingName(false)
    } catch {
      setClaimError("Couldn't claim this team — you may already be scoring for another one.")
    }
  }

  // Stops scoring for this team: releases the scorekeeper role (a teammate
  // can then claim it on their own phone). Doesn't change who this device
  // "follows" — you can keep this as your default team without being its
  // scorekeeper.
  const stopScoring = async () => {
    await leaveTeam(team.id)
    navigate('/teams')
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
            <p>No one has picked up scoring for this group yet.</p>
          )}

          <div className="team-view-actions">
            {!team.claimedBy &&
              (scorekeeperElsewhere ? (
                <p className="muted">
                  You're already scoring for Group {scorekeeperElsewhere.group}. Stop scoring there
                  first if you need to switch.
                </p>
              ) : (
                <button className="btn btn-primary btn-sm" onClick={() => setPickingName(true)}>
                  That's me, I'll score
                </button>
              ))}
            {isMyTeam ? (
              <button className="btn btn-sm" onClick={() => setMyTeamId(null)}>
                Not your team? Unfollow
              </button>
            ) : (
              <button className="btn btn-sm" onClick={() => setMyTeamId(team.id)}>
                This is my team
              </button>
            )}
          </div>

          {claimError && <p className="muted error-text">{claimError}</p>}
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
            <button className="btn btn-sm btn-danger" onClick={stopScoring}>
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
