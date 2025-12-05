"use client"

import { useEffect, useMemo, useState } from "react"
import { db } from "@/lib/firebase"
import type { Topic } from "@/types/collections"
import { listTopics, createTopic } from "@/repositories/topics"
import { collection, onSnapshot } from "firebase/firestore"

export function useTopics() {
  const enabled = useMemo(() => !!db, [])
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(false)

  async function reload() {
    if (!db) return
    setLoading(true)
    try {
      const list = await listTopics(db)
      setTopics(list)
    } finally {
      setLoading(false)
    }
  }

  async function create(name: string) {
    if (!db) return null
    const created = await createTopic(db, name)
    return created
  }

  useEffect(() => {
    if (!db) return
    setLoading(true)
    const unsub = onSnapshot(collection(db, "topics"), (snap) => {
      setTopics(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Topic, "id">) })))
      setLoading(false)
    }, () => setLoading(false))
    return () => unsub()
  }, [])

  return { enabled, topics, loading, reload, create }
}
