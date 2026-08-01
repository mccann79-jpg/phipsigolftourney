import { useState } from 'react'
import { useAuthUser } from '../hooks/useAuthUser'
import { useTeams } from '../hooks/useTeams'
import { useTournamentSettings } from '../hooks/useTournamentSettings'
import { signInWithGoogle, signOutAdmin } from '../firebase'
import { seedTeams, resetTeam, resetAllScores, unlockTeam, saveSettings } from '../data/firestoreApi'
import { ADMIN_EMAIL, TOURNAMENT } from '../data/course'
import './Admin.css'

export default function Admin() {
  const { user, loading, isAdmin } = useAuthUser()
  const { teams } = useTeams()
  const { settings } = useTournamentSettings()
  const [busy, setBusy] = useState(null)
  const [dateInput, setDateInput] = useState(settings.date || '')
  const [nameInput, setNameInput] = useState(settings.name || TOURNAMENT.name)
  const [signInError, setSignInError] = useState(null)

  if (loading) return <div className="container">Loading…</div>

  if (!user || user.isAnonymous) {
    return (
      <div className="container stack">
        <h1>Admin</h1>
        <div className="card stack">
          <p>Sign in with the tournament admin's Google account to manage the tournament.</p>
          <button
            className="btn btn-primary"
            onClick={() =>
              signInWithGoogle().catch((err) => {
                console.error(err)
                setSignInError(err.message)
              })
            }
          >
            Sign in with Google
          </button>
          {signInError && <p className="muted">{signInError}</p>}
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="container stack">
        <h1>Admin</h1>
        <div className="card stack">
          <p>
            Signed in as <strong>{user.email}</strong>, but that's not the tournament admin
            account ({ADMIN_EMAIL}).
          </p>
          <button className="btn btn-sm" onClick={() => signOutAdmin()}>
            Sign out
          </button>
        </div>
      </div>
    )
  }

  const run = async (key, fn) => {
    setBusy(key)
    try {
      await fn()
    } catch (err) {
      console.error(err)
      alert(err.message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="container stack">
      <div className="page-title">
        <h1>Admin</h1>
        <button className="btn btn-sm" onClick={() => signOutAdmin()}>
          Sign out ({user.email})
        </button>
      </div>

      <div className="card stack">
        <h2>Tournament settings</h2>
        <label className="muted">Tournament name</label>
        <input type="text" value={nameInput} onChange={(e) => setNameInput(e.target.value)} />
        <label className="muted">Date</label>
        <input type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)} />
        <button
          className="btn btn-primary btn-sm"
          disabled={busy === 'settings'}
          onClick={() =>
            run('settings', () =>
              saveSettings({
                name: nameInput.trim() || TOURNAMENT.name,
                date: dateInput,
              }),
            )
          }
        >
          Save settings
        </button>
      </div>

      <div className="card stack">
        <h2>Tournament data</h2>
        <p className="muted">
          {teams.length === 0
            ? 'No teams exist yet. Seed the tournament to create the 7 groups from the tee sheet.'
            : `${teams.length} teams loaded.`}
        </p>
        <button
          className="btn btn-gold"
          disabled={busy === 'seed'}
          onClick={() =>
            window.confirm(
              teams.length
                ? 'Re-seed will overwrite team rosters/tee times back to the original tee sheet, but keeps current scores/claims for existing teams. Continue?'
                : 'Create the 7 tournament teams from the tee sheet?',
            ) && run('seed', seedTeams)
          }
        >
          {teams.length ? 'Re-seed rosters & tee times' : 'Seed tournament teams'}
        </button>

        {teams.length > 0 && (
          <button
            className="btn btn-danger"
            disabled={busy === 'reset-all'}
            onClick={() =>
              window.confirm('Reset ALL scores and team claims for every group? This cannot be undone.') &&
              run('reset-all', () => resetAllScores(teams.map((t) => t.id)))
            }
          >
            Reset all scores &amp; claims
          </button>
        )}
      </div>

      {teams.length > 0 && (
        <div className="card stack">
          <h2>Teams</h2>
          {teams.map((t) => (
            <div key={t.id} className="admin-team-row">
              <div>
                <strong>Group {t.group}</strong>
                <div className="muted">{t.teeTime} · {t.players.join(', ')}</div>
                <div className="muted">
                  {t.claimedBy ? `Claimed by ${t.claimedBy.name}` : 'Unclaimed'}
                </div>
              </div>
              <div className="admin-team-actions">
                {t.claimedBy && (
                  <button className="btn btn-sm" disabled={busy === `unlock-${t.id}`} onClick={() => run(`unlock-${t.id}`, () => unlockTeam(t.id))}>
                    Unlock claim
                  </button>
                )}
                <button
                  className="btn btn-sm btn-danger"
                  disabled={busy === `reset-${t.id}`}
                  onClick={() =>
                    window.confirm(`Reset Group ${t.group}'s scores and claim?`) &&
                    run(`reset-${t.id}`, () => resetTeam(t.id))
                  }
                >
                  Reset team
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
