import { useEffect, useState } from 'react'
import { subscribeTeams } from '../data/firestoreApi'
import { isFirebaseConfigured } from '../firebase'

export function useTeams() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
