import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'

// This app only needs two values from the Firebase console:
//   apiKey    - authenticates the anonymous sign-in request
//   projectId - identifies which Firestore database to talk to
// The other four fields in Firebase's snippet cover features we don't use:
// storageBucket (Cloud Storage), messagingSenderId (push notifications) and
// appId (Analytics). authDomain only matters for OAuth popup/redirect
// flows, which went away with the admin Google sign-in, and it follows a
// fixed pattern anyway - so derive it rather than making someone copy it.
// Each is still overridable by env var for anyone with a custom setup.
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || undefined,
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
