import { Navigate, Link } from 'react-router-dom'
import { useTeams } from '../hooks/useTeams'
import { useMyTeam } from '../context/MyTeamContext'
import { COURSE, TOURNAMENT } from '../data/course'
import logo from '../assets/kak-logo-192.png'
import './Home.css'

function TeamCard({ team, isMine }) {
  return (
    <Link to={`/team/${team.id}`} className={`card team-card ${isMine ? 'team-card-mine' : ''}`}>
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

// The Scorecard tab's root. At '/', a device that already claimed a team
// jumps straight to its scorecard; '/teams' always shows the full list so
// you can switch teams or view someone else's card.
export default function Home({ browse = false }) {
  const { teams, loading, error } = useTeams()
  const { myTeamId } = useMyTeam()

  if (!browse && !loading && myTeamId && teams.some((t) => t.id === myTeamId)) {
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
      {error?.startsWith('seed-failed') && (
        <div className="card stack">
          <p>
            <strong>Couldn't set up the tournament teams.</strong>
          </p>
          <p className="muted">
            This usually means the Firestore security rules in the Firebase console are out of date
            — paste the latest <code>firestore.rules</code> from the repo and publish, then reload
            this page.
          </p>
          <p className="muted">({error.replace('seed-failed:', 'Firestore error: ')})</p>
        </div>
      )}
      {!loading && error && error !== 'not-configured' && !error.startsWith('seed-failed') && (
        <p className="muted">Couldn't load teams: {error}</p>
      )}
      {!loading && !error && teams.length === 0 && <p className="muted">Setting up the tournament…</p>}

      {teams.map((team) => (
        <TeamCard key={team.id} team={team} isMine={team.id === myTeamId} />
      ))}
    </div>
  )
}
