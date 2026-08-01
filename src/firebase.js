import { initializeApp } from 'firebase/app'
import {
  connectAuthEmulator,
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
} from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

let app, auth, db

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

  // Every visitor (players included) gets a silent anonymous auth session.
  // This is what lets Firestore security rules tell "some visitor" apart
  // from "nobody" without asking players to create an account.
  onAuthStateChanged(auth, (user) => {
    if (!user) signInAnonymously(auth).catch((err) => console.error('Anonymous sign-in failed', err))
  })
}

export { app, auth, db }

const googleProvider = new GoogleAuthProvider()

export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider)
}

export function signOutAdmin() {
  return signOut(auth).finally(() => signInAnonymously(auth))
}
