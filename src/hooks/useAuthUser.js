import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../firebase'
import { ADMIN_EMAIL } from '../data/course'

export function useAuthUser() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  const isAdmin = Boolean(user && !user.isAnonymous && user.email === ADMIN_EMAIL)

  return { user, loading, isAdmin }
}
