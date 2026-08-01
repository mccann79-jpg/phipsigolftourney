import { createContext, useCallback, useContext, useState } from 'react'

// `myTeamId` is this device's followed team — which scorecard the Scorecard
// tab defaults to and which row is highlighted on the Leaderboard. It's
// independent of scorekeeper status (see useAuthUid + team.claimedByUid in
// TeamView.jsx): you can follow a team without ever claiming it, or claim a
// team on a device that isn't following it.
const TEAM_KEY = 'kak-my-team-id'
const NAME_KEY = 'kak-my-name'

const MyTeamContext = createContext(null)

export function MyTeamProvider({ children }) {
  const [myTeamId, setMyTeamIdState] = useState(() => localStorage.getItem(TEAM_KEY))
  const [myName, setMyNameState] = useState(() => localStorage.getItem(NAME_KEY) || '')

  const setMyTeamId = useCallback((id) => {
    if (id) localStorage.setItem(TEAM_KEY, id)
    else localStorage.removeItem(TEAM_KEY)
    setMyTeamIdState(id)
  }, [])

  const setMyName = useCallback((name) => {
    localStorage.setItem(NAME_KEY, name)
    setMyNameState(name)
  }, [])

  return (
    <MyTeamContext.Provider value={{ myTeamId, setMyTeamId, myName, setMyName }}>
      {children}
    </MyTeamContext.Provider>
  )
}

export function useMyTeam() {
  const ctx = useContext(MyTeamContext)
  if (!ctx) throw new Error('useMyTeam must be used within MyTeamProvider')
  return ctx
}
