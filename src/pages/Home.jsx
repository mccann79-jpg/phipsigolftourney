import { Navigate, Link } from 'react-router-dom'
import { useTeams } from '../hooks/useTeams'
import { useMyTeam } from '../context/MyTeamContext'
import { COURSE, TOURNAMENT } from '../data/course'
import logo from '../assets/kak-logo-192.png'
import './Home.css'

function TeamCard({ team }) {
  return (
    <Link to={`/team/${team.id}`} className="card team-card">
      <div className="team-card-top">
        <h3>
          Group {team.group}
          {team.strokeAdvantage > 0 && (
            <span className="badge badge-gold" title="Stroke advantage">
              +{team.strokeAdvantage} adv.
            </span>
          )}
        </h3>
        <span className="muted">{team.teeTime}</span>
      </div>
      <p className="team-players">{team.players.join(' · ')}</p>
      <p className="muted">{team.claimedBy ? `Scoring: ${team.claimedBy.name}` : 'No scorekeeper yet'}</p>
    </Link>
  )
}

// The Scorecard tab's root: if this device already claimed a team, jump
// straight to its scorecard. Otherwise, show the roster so someone can pick
// their team and name.
export default function Home() {
  const { teams, loading, error } = useTeams()
  const { myTeamId } = useMyTeam()

  if (!loading && myTeamId && teams.some((t) => t.id === myTeamId)) {
    return <Navigate to={`/team/${myTeamId}`} replace />
  }

  return (
    <div className="container stack">
      <div className="card stack hero-card">
        <img src={logo} alt="KAK Invitational" className="hero-logo" width="72" height="72" />
        <h1>{TOURNAMENT.name}</h1>
        <p className="muted">
          {TOURNAMENT.format} · {COURSE.tee.name} tees · {COURSE.name}
        </p>
      </div>

      <p className="muted">Tap your team, then tap your name to start scoring.</p>

      {loading && <p className="muted">Loading teams…</p>}
      {error === 'not-configured' && <p className="muted">Firebase isn't configured yet — see README.md.</p>}
      {!loading && error && error !== 'not-configured' && <p className="muted">Couldn't load teams: {error}</p>}
      {!loading && !error && teams.length === 0 && <p className="muted">Setting up the tournament…</p>}

      {teams.map((team) => (
        <TeamCard key={team.id} team={team} />
      ))}
    </div>
  )
}
