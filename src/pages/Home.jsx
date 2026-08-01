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

      {loading && !error && <p className="muted">Loading teams…</p>}
      {error === 'not-configured' && <p className="muted">Firebase isn't configured yet — see README.md.</p>}
      {error?.startsWith('auth-failed') && (
        <div className="card stack">
          <p>
            <strong>Couldn't connect to Firebase.</strong>
          </p>
          <p className="muted">
            Two things to check in the Firebase console: that the six{' '}
            <code>VITE_FIREBASE_*</code> GitHub secrets exactly match Project settings → General →
            Your apps (copy them with the copy button rather than retyping), and that
            Authentication → Sign-in method has <strong>Anonymous</strong> enabled.
          </p>
          <p className="muted">({error.replace('auth-failed:', 'Firebase error: ')})</p>
        </div>
      )}
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
      {!loading &&
        error &&
        error !== 'not-configured' &&
        !error.startsWith('seed-failed') &&
        !error.startsWith('auth-failed') && <p className="muted">Couldn't load teams: {error}</p>}
      {!error && teams.length === 0 && !loading && <p className="muted">Setting up the tournament…</p>}

      {teams.map((team) => (
        <TeamCard key={team.id} team={team} isMine={team.id === myTeamId} />
      ))}
    </div>
  )
}
