import { useEffect, useRef, useState } from 'react'
import { subscribeTeams, ensureTeamsSeeded } from '../data/firestoreApi'
import { isFirebaseConfigured, authReady } from '../firebase'

export function useTeams() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const seedAttempted = useRef(false)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      setError('not-configured')
      return
    }

    // A bad API key or a disabled Anonymous provider fails here. Surface it
    // rather than letting the app sit on a spinner with no explanation.
    let settled = false
    authReady.then(
      () => {
        settled = true
      },
      (err) => {
        settled = true
        setLoading(false)
        setError(`auth-failed:${err.code || err.message}`)
      },
    )

    // Sign-in can also just hang — no error, no success — on the flaky cell
    // service you get on a golf course, or when a request is blocked
    // outright. Without this the app spins forever with nothing to act on.
    const authTimeout = setTimeout(() => {
      if (!settled) {
        setLoading(false)
        setError('auth-failed:timeout — no response from Firebase')
      }
    }, 15000)

    const unsub = subscribeTeams(
      (t) => {
        setTeams(t)
        setLoading(false)
        if (t.length === 0 && !seedAttempted.current) {
          seedAttempted.current = true
          ensureTeamsSeeded().catch((err) => {
            console.error('Auto-seed failed', err)
            const code = err.code || 'unknown'
            // Seeding awaits sign-in, so an auth failure surfaces here too —
            // report it as the connection problem it is, not as a rules problem.
            setError(code.startsWith('auth/') ? `auth-failed:${code}` : `seed-failed:${code}`)
          })
        }
      },
      (err) => {
        console.error(err)
        setError(err.message)
        setLoading(false)
      },
    )
    return () => {
      clearTimeout(authTimeout)
      unsub()
    }
  }, [])

  return { teams, loading, error }
}
