import { Link } from 'react-router-dom'
import { useTeams } from '../hooks/useTeams'
import { useTournamentSettings } from '../hooks/useTournamentSettings'
import { COURSE, TOURNAMENT, RULES, GROUPS } from '../data/course'
import Scorecard from '../components/Scorecard'
import './CourseInfo.css'

export default function CourseInfo() {
  const { teams } = useTeams()
  const { settings } = useTournamentSettings()
  const groups = teams.length ? teams : GROUPS

  return (
    <div className="container stack">
      <div className="page-title">
        <h1>{settings.name || TOURNAMENT.name}</h1>
        <Link className="btn btn-sm" to="/">
          Teams
        </Link>
      </div>

      <div className="card stack">
        <h2>{COURSE.name}</h2>
        <p>
          <a href={COURSE.mapsUrl} target="_blank" rel="noreferrer">
            {COURSE.address}
          </a>
        </p>
        <p className="muted">{COURSE.phone}</p>
        <p className="muted">
          Playing the <strong>{COURSE.tee.name}</strong> tees — rating {COURSE.tee.rating}, slope{' '}
          {COURSE.tee.slope}, {COURSE.tee.yardage.toLocaleString()} yards. Format:{' '}
          {TOURNAMENT.format}.
        </p>
        {settings.date && (
          <p className="muted">
            {new Date(settings.date + 'T00:00:00').toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}
      </div>

      <div className="card stack">
        <h2>Tee times</h2>
        <div className="tee-time-list">
          {groups.map((g) => (
            <div key={g.id || g.group} className="tee-time-row">
              <span className="tee-time-time">{g.teeTime}</span>
              <span className="tee-time-group">Group {g.group}</span>
              <span className="tee-time-players muted">{g.players.join(', ')}</span>
              {g.strokeAdvantage > 0 && <span className="badge badge-gold">+{g.strokeAdvantage} adv.</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="card stack">
        <h2>Scorecard — Blue tees</h2>
        <Scorecard scores={{}} />
      </div>

      <div className="card stack">
        <h2>Rules</h2>
        {RULES.map((r) => (
          <div key={r.title}>
            <h3>{r.title}</h3>
            <p className="muted">{r.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
