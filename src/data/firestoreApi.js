import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteField,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'
import { GROUPS } from './course'

const TEAMS_COL = 'teams'
const SETTINGS_DOC = 'settings/tournament'

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

export function subscribeSettings(onChange, onError) {
  const ref = doc(db, SETTINGS_DOC)
  return onSnapshot(ref, (snap) => onChange(snap.exists() ? snap.data() : null), onError)
}

// Admin only (enforced by firestore.rules): (re)initializes the 7 teams from
// the roster baked into src/data/course.js and clears all scores/claims.
export async function seedTeams() {
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

// Admin only: wipes one team's scores and claim.
export async function resetTeam(teamId) {
  const ref = doc(db, TEAMS_COL, teamId)
  await updateDoc(ref, {
    scores: {},
    claimedBy: null,
    updatedAt: serverTimestamp(),
  })
}

// Admin only: wipes every team's scores and claims (keeps roster/tee times).
export async function resetAllScores(teamIds) {
  const batch = writeBatch(db)
  for (const id of teamIds) {
    batch.update(doc(db, TEAMS_COL, id), {
      scores: {},
      claimedBy: null,
      updatedAt: serverTimestamp(),
    })
  }
  await batch.commit()
}

// Admin only.
export async function unlockTeam(teamId) {
  const ref = doc(db, TEAMS_COL, teamId)
  await updateDoc(ref, { claimedBy: null, updatedAt: serverTimestamp() })
}

// Admin only.
export async function saveSettings(settings) {
  const ref = doc(db, SETTINGS_DOC)
  await setDoc(ref, { ...settings, updatedAt: serverTimestamp() }, { merge: true })
}
