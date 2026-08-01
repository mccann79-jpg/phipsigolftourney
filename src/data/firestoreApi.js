import { collection, doc, onSnapshot, updateDoc, deleteField, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import { GROUPS } from './course'

const TEAMS_COL = 'teams'

export function subscribeTeams(onChange, onError) {
  const ref = collection(db, TEAMS_COL)
  return onSnapshot(
    ref,
    (snap) => {
      const teams = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      teams.sort((a, b) => a.group - b.group)
      onChange(teams)
    },
    onError,
  )
}

// Populates the 7 tournament teams from src/data/course.js the first time
// anyone loads the app with an empty `teams` collection. Safe to call more
// than once — it always writes the same fixed document IDs.
export async function ensureTeamsSeeded() {
  const batch = writeBatch(db)
  for (const g of GROUPS) {
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
// for the first time and to hand the role off to a teammate.
export async function claimTeam(teamId, name) {
  const ref = doc(db, TEAMS_COL, teamId)
  await updateDoc(ref, {
    claimedBy: { name, claimedAt: Date.now() },
    updatedAt: serverTimestamp(),
  })
}

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
