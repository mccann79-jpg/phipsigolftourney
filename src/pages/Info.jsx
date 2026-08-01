import { useTeams } from '../hooks/useTeams'
import { COURSE, TOURNAMENT, RULES, GROUPS } from '../data/course'
import Scorecard from '../components/Scorecard'
import './Info.css'

export default function Info() {
  const { teams } = useTeams()
  const groups = teams.length ? teams : GROUPS

  return (
    <div className="container stack">
      <h1>{TOURNAMENT.name}</h1>

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
        {TOURNAMENT.date && (
          <p className="muted">
            {new Date(TOURNAMENT.date + 'T00:00:00').toLocaleDateString(undefined, {
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
