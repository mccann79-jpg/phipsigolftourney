import { useEffect, useState } from 'react'
import { authReady } from '../firebase'

// This device's anonymous auth uid, once sign-in settles. Used to derive
// scorekeeper status from `team.claimedByUid` — the source of truth — rather
// than the "my team" localStorage preference in MyTeamContext, which now
// just tracks which team's scorecard/leaderboard row to default to.
export function useAuthUid() {
  const [uid, setUid] = useState(null)

  useEffect(() => {
    let mounted = true
    authReady.then(
      (user) => {
        if (mounted && user) setUid(user.uid)
      },
      () => {},
    )
    return () => {
      mounted = false
    }
  }, [])

  return uid
}
