import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'

import { firebaseConfig as fileConfig } from './firebaseConfig'

// Config comes from src/firebaseConfig.js — paste the block from the
// Firebase console there and commit it. Env vars still win if set, so a
// fork can supply its own project without editing the file.
const firebaseConfig = {
  ...fileConfig,
  ...(import.meta.env.VITE_FIREBASE_API_KEY && { apiKey: import.meta.env.VITE_FIREBASE_API_KEY }),
  ...(import.meta.env.VITE_FIREBASE_PROJECT_ID && {
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  }),
  ...(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN && {
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  }),
}

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

let app, auth, db
let settleAuth
// Settles once anonymous sign-in completes, and REJECTS if it fails. Writes
// that need auth (like auto-seeding teams) await this rather than firing
// immediately on mount, so they can't lose the race against
// signInAnonymously on a slow connection and fail with permission-denied.
// It must always settle: a promise that never resolves would leave the app
// stuck on "Loading teams…" forever with no visible explanation.
export const authReady = new Promise((resolve, reject) => {
  settleAuth = { resolve, reject }
})
// Callers attach their own handlers; this keeps a rejected authReady from
// surfacing as an unhandled promise rejection when nothing is awaiting yet.
authReady.catch(() => {})

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)

  // Optional: point the local dev server at `firebase emulators:start`
  // instead of real Firebase. Never runs in a production build.
  if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
    connectFirestoreEmulator(db, '127.0.0.1', 8080)
  }

  // Every visitor gets a silent anonymous auth session. This is what lets
  // Firestore security rules tell "some visitor" apart from "nobody"
  // without asking anyone to create an account or sign in.
  onAuthStateChanged(auth, (user) => {
    if (user) {
      settleAuth.resolve(user)
      return
    }
    signInAnonymously(auth).catch((err) => {
      console.error('Anonymous sign-in failed', err)
      settleAuth.reject(err)
    })
  })
} else {
  settleAuth.resolve(null)
}

export { app, auth, db }
