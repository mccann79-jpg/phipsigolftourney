import { useState } from 'react'
import { leaveTeam } from '../data/firestoreApi'
import { ADMIN_PIN } from '../adminConfig'
import './AdminSection.css'

// PIN-gated panel for clearing a stuck scorekeeper claim from a phone on the
// course, without needing Firebase console access. See the PIN/security
// note in src/adminConfig.js and firestore.rules.
export default function AdminSection({ teams }) {
  const [unlocked, setUnlocked] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [clearingId, setClearingId] = useState(null)

  const tryUnlock = (e) => {
    e.preventDefault()
    if (pin === ADMIN_PIN) {
      setUnlocked(true)
      setError(false)
    } else {
      setError(true)
    }
    setPin('')
  }

  const clear = async (teamId) => {
    setClearingId(teamId)
    try {
      await leaveTeam(teamId)
    } finally {
      setClearingId(null)
    }
  }

  return (
    <div className="card stack admin-section">
      <h2>Admin</h2>
      {!unlocked ? (
        <form className="admin-unlock" onSubmit={tryUnlock}>
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
          <button className="btn btn-sm" type="submit">
            Unlock
          </button>
          {error && <p className="muted error-text">Wrong PIN.</p>}
        </form>
      ) : (
        <div className="stack">
          <p className="muted">Clear a stuck scorekeeper so their team can be claimed again.</p>
          {teams.map((t) => (
            <div key={t.id} className="admin-team-row">
              <span>
                Group {t.group} — {t.claimedBy ? t.claimedBy.name : <span className="muted">unclaimed</span>}
              </span>
              {t.claimedBy && (
                <button
                  className="btn btn-sm btn-danger"
                  disabled={clearingId === t.id}
                  onClick={() => clear(t.id)}
                >
                  {clearingId === t.id ? 'Clearing…' : 'Clear'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
