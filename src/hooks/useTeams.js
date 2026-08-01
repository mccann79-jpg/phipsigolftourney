import { useEffect, useRef, useState } from 'react'
import { subscribeTeams, ensureTeamsSeeded } from '../data/firestoreApi'
import { isFirebaseConfigured } from '../firebase'

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
    const unsub = subscribeTeams(
      (t) => {
        setTeams(t)
        setLoading(false)
        if (t.length === 0 && !seedAttempted.current) {
          seedAttempted.current = true
          ensureTeamsSeeded().catch((err) => console.error('Auto-seed failed', err))
        }
      },
      (err) => {
        console.error(err)
        setError(err.message)
        setLoading(false)
      },
    )
    return unsub
  }, [])

  return { teams, loading, error }
}
