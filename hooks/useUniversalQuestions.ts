"use client"

import { useEffect, useMemo, useState } from "react"
import { db } from "@/lib/firebase"
import type { UniversalQuestion } from "@/types/collections"
import { createUniversalQuestion, listUniversalQuestions } from "@/repositories/universalQuestions"
import { collection, onSnapshot, query, orderBy } from "firebase/firestore"

export function useUniversalQuestions() {
  const enabled = useMemo(() => !!db, [])
  const [questions, setQuestions] = useState<UniversalQuestion[]>([])
  const [loading, setLoading] = useState(false)

  async function createQuestion(input: Omit<UniversalQuestion, "id" | "createdAt" | "updatedAt">) {
    if (!db) return null
    return await createUniversalQuestion(db, input)
  }
  async function reload() {
    if (!db) return
    setLoading(true)
    try {
      const list = await listUniversalQuestions(db)
      setQuestions(list)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!db) return
    setLoading(true)
    const q = query(collection(db, "questions"), orderBy("createdAt", "desc"))
    const unsub = onSnapshot(q, (snap) => {
      setQuestions(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<UniversalQuestion, "id">) })))
      setLoading(false)
    }, () => setLoading(false))
    return () => unsub()
  }, [])

  return { enabled, questions, loading, reload, createQuestion }
}
