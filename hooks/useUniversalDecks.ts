"use client"

import { useEffect, useMemo, useState } from "react"
import { db } from "@/lib/firebase"
import type { UniversalDeck } from "@/types/collections"
import { createUniversalDeck, listUniversalDecks, updateUniversalDeck, deleteUniversalDeck } from "@/repositories/universalDecks"
import { collection, onSnapshot, query, orderBy } from "firebase/firestore"

export function useUniversalDecks() {
  const enabled = useMemo(() => !!db, [])
  const [decks, setDecks] = useState<UniversalDeck[]>([])
  const [loading, setLoading] = useState(false)

  async function reload() {
    if (!db) return
    setLoading(true)
    try {
      const list = await listUniversalDecks(db)
      setDecks(list)
    } finally {
      setLoading(false)
    }
  }

  async function createDeck(input: Pick<UniversalDeck, "title" | "topicId" | "level"> & { questions: string[] }) {
    if (!db) return null
    const created = await createUniversalDeck(db, input)
    return created
  }

  async function updateDeck(id: string, data: Partial<Pick<UniversalDeck, "title" | "topicId" | "level" | "questions">>) {
    if (!db) return
    await updateUniversalDeck(db, id, data)
  }

  async function removeDeck(id: string) {
    if (!db) return
    await deleteUniversalDeck(db, id)
  }

  useEffect(() => {
    if (!db) return
    setLoading(true)
    const q = query(collection(db, "decks"), orderBy("createdAt", "desc"))
    const unsub = onSnapshot(q, (snap) => {
      setDecks(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<UniversalDeck, "id">) })))
      setLoading(false)
    }, () => setLoading(false))
    return () => unsub()
  }, [])

  return { enabled, decks, loading, reload, createDeck, updateDeck, removeDeck }
}
