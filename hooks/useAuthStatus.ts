"use client"

import { useEffect, useState } from "react"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"

export function useAuthStatus() {
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    if (!auth) return
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUserId(null)
        setUserName(null)
        setIsAdmin(null)
        return
      }
      setUserId(u.uid)
      setUserName(u.displayName || u.email || u.uid)
      if (!db) {
        setIsAdmin(null)
        return
      }
      try {
        const snap = await getDoc(doc(db, "users", u.uid))
        setIsAdmin(snap.exists() ? snap.data()?.IsAdmin === true : false)
      } catch {
        setIsAdmin(null)
      }
    })
    return () => unsub()
  }, [])

  return { userId, userName, isAdmin }
}

