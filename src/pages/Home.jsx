import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTeams } from '../hooks/useTeams'
import { useMyTeam } from '../context/MyTeamContext'
import { useTournamentSettings } from '../hooks/useTournamentSettings'
import { claimTeam } from '../data/firestoreApi'
import { COURSE, TOURNAMENT } from '../data/course'
import './Home.css'

function ClaimForm({ team, onDone }) {
  const { myName, setMyName, setMyTeamId } = useMyTeam()
  const [name, setName] = useState(myName)
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setSaving(true)
    try {
      await claimTeam(team.id, trimmed)
      setMyName(trimmed)
      setMyTeamId(team.id)
      onDone()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="claim-form" onSubmit={submit}>
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
      <button className="btn btn-primary btn-sm" type="submit" disabled={saving || !name.trim()}>
        {saving ? 'Saving…' : 'Confirm'}
      </button>
    </form>
  )
}

function TeamCard({ team }) {
  const { myTeamId, setMyTeamId } = useMyTeam()
  const [claiming, setClaiming] = useState(false)
  const isMine = myTeamId === team.id
  const claimedByOther = team.claimedBy && !isMine

  return (
    <div className={`card team-card ${isMine ? 'team-card-mine' : ''}`}>
      <div className="team-card-top">
        <div>
          <h3>
            Group {team.group}
            {team.strokeAdvantage > 0 && <span className="badge badge-gold" title="Stroke advantage">+{team.strokeAdvantage} adv.</span>}
          </h3>
          <p className="muted">{team.teeTime} tee time</p>
        </div>
        {isMine && <span className="badge">Your team</span>}
      </div>

      <p className="team-players">{team.players.join(' · ')}</p>

      {team.claimedBy && (
        <p className="muted">
          {isMine ? 'You are' : `${team.claimedBy.name} is`} tracking scores for this group.
        </p>
      )}

      <div className="team-card-actions">
        <Link className="btn btn-sm" to={`/team/${team.id}`}>
          View scorecard
        </Link>
        {!isMine && !claiming && (
          <button
            className="btn btn-sm btn-primary"
            onClick={() => setClaiming(true)}
          >
            {claimedByOther ? 'Take over scoring' : "I'm scoring this team"}
          </button>
        )}
        {isMine && (
          <button className="btn btn-sm" onClick={() => setMyTeamId(null)}>
            Switch team
          </button>
        )}
      </div>

      {claiming && (
        <>
          {claimedByOther && (
            <p className="muted claim-warning">
              {team.claimedBy.name} already claimed this group — only take over if that phone is unavailable.
            </p>
          )}
          <ClaimForm team={team} onDone={() => setClaiming(false)} />
        </>
      )}
    </div>
  )
}

export default function Home() {
  const { teams, loading, error } = useTeams()
  const { settings } = useTournamentSettings()

  return (
    <div className="container stack">
      <div className="card stack hero-card">
        <h1>{settings.name || TOURNAMENT.name}</h1>
        <p className="muted">
          {TOURNAMENT.format} · {COURSE.tee.name} tees · {COURSE.name}
        </p>
        {settings.date && <p className="muted">{new Date(settings.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>}
        <div className="hero-links">
          <Link className="btn" to="/leaderboard">
            Leaderboard
          </Link>
          <Link className="btn" to="/course">
            Course &amp; tee times
          </Link>
        </div>
      </div>

      <h2>Select your team</h2>
      <p className="muted">
        Tap your group below, enter your name, and that phone becomes the scorekeeper for your
        team. Anyone can view every scorecard live.
      </p>

      {loading && <p className="muted">Loading teams…</p>}
      {error === 'not-configured' && (
        <p className="muted">Firebase isn't configured yet — see README.md.</p>
      )}
      {!loading && error && error !== 'not-configured' && (
        <p className="muted">Couldn't load teams: {error}</p>
      )}
      {!loading && !error && teams.length === 0 && (
        <div className="card">
          <p>No teams have been set up yet.</p>
          <p className="muted">
            Ask the tournament admin to sign in and seed the tournament from the Admin page.
          </p>
        </div>
      )}

      {teams.map((team) => (
        <TeamCard key={team.id} team={team} />
      ))}
    </div>
  )
}
