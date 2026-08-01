import { useEffect, useState } from 'react'
import { subscribeSettings } from '../data/firestoreApi'
import { isFirebaseConfigured } from '../firebase'
import { TOURNAMENT } from '../data/course'

const DEFAULTS = { name: TOURNAMENT.name, date: '' }

export function useTournamentSettings() {
  const [settings, setSettings] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }
    const unsub = subscribeSettings(
      (s) => {
        setSettings(s ? { ...DEFAULTS, ...s } : DEFAULTS)
        setLoading(false)
      },
      (err) => {
        console.error(err)
        setLoading(false)
      },
    )
    return unsub
  }, [])

  return { settings, loading }
}
