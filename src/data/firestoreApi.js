import { collection, doc, onSnapshot, updateDoc, deleteField, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db, authReady } from '../firebase'
import { GROUPS } from './course'

const TEAMS_COL = 'teams'
const KNOWN_TEAM_IDS = new Set(GROUPS.map((g) => g.id))

export function subscribeTeams(onChange, onError) {
  const ref = collection(db, TEAMS_COL)
  return onSnapshot(
    ref,
    (snap) => {
      const teams = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        // Ignore anything that isn't one of the 7 tournament groups, so a
        // stray document can't surface as a phantom team in the list or on
        // the leaderboard.
        .filter((t) => KNOWN_TEAM_IDS.has(t.id))
      teams.sort((a, b) => a.group - b.group)
      onChange(teams)
    },
    onError,
  )
}

// Creates any of the 7 tournament groups that don't exist yet, from the
// roster in src/data/course.js. Idempotent: teams that already exist are
// left completely untouched, so this can never clobber live scores or an
// in-progress scorekeeper claim.
export async function ensureTeamsSeeded(existingIds = []) {
  await authReady
  const have = new Set(existingIds)
  const missing = GROUPS.filter((g) => !have.has(g.id))
  if (missing.length === 0) return

  const batch = writeBatch(db)
  for (const g of missing) {
    const ref = doc(db, TEAMS_COL, g.id)
    batch.set(ref, {
      group: g.group,
      teeTime: g.teeTime,
      players: g.players,
      ghinAvg: g.ghinAvg,
      strokeAdvantage: g.strokeAdvantage,
      claimedBy: null,
      scores: {},
      updatedAt: serverTimestamp(),
    })
  }
  await batch.commit()
}

// Claims a team for the given player name — used both to become scorekeeper
// for the first time and to hand the role off to a teammate. `claimedByUid`
// ties the claim to this browser's anonymous auth session; firestore.rules
// only lets that same session edit `scores`/`claimedBy` again afterward, so
// another visitor can't take over an already-claimed team.
export async function claimTeam(teamId, name) {
  const user = await authReady
  const ref = doc(db, TEAMS_COL, teamId)
  await updateDoc(ref, {
    claimedBy: { name, claimedAt: Date.now() },
    claimedByUid: user.uid,
    updatedAt: serverTimestamp(),
  })
}

// Releases the scorekeeper role so anyone can pick it up again — used when
// someone joins the wrong team by mistake.
export async function leaveTeam(teamId) {
  const ref = doc(db, TEAMS_COL, teamId)
  await updateDoc(ref, {
    claimedBy: null,
    claimedByUid: null,
    updatedAt: serverTimestamp(),
  })
}

// Score edits only succeed if this browser's session is the one that holds
// the claim (see claimTeam above) — enforced by firestore.rules.
export async function setHoleScore(teamId, hole, strokes) {
  const ref = doc(db, TEAMS_COL, teamId)
  await updateDoc(ref, {
    [`scores.${hole}`]: strokes,
    updatedAt: serverTimestamp(),
  })
}

export async function clearHoleScore(teamId, hole) {
  const ref = doc(db, TEAMS_COL, teamId)
  await updateDoc(ref, {
    [`scores.${hole}`]: deleteField(),
    updatedAt: serverTimestamp(),
  })
}
