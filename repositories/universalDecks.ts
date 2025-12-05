import { collection, getDocs, updateDoc, addDoc, doc, deleteDoc } from "firebase/firestore"
import type { Firestore } from "firebase/firestore"
import type { UniversalDeck } from "@/types/collections"

export async function listUniversalDecks(db: Firestore): Promise<UniversalDeck[]> {
  const snap = await getDocs(collection(db, "decks"))
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<UniversalDeck, "id">) }))
}

export async function createUniversalDeck(
  db: Firestore,
  input: Pick<UniversalDeck, "title" | "topicId" | "level"> & { questions: string[] }
): Promise<UniversalDeck> {
  const now = Date.now()
  const ref = await addDoc(collection(db, "decks"), {
    title: input.title,
    topicId: input.topicId,
    level: input.level,
    questions: input.questions,
    createdAt: now,
    updatedAt: now,
  } as Omit<UniversalDeck, "id">)
  await updateDoc(ref, { id: ref.id })
  return { id: ref.id, title: input.title, topicId: input.topicId, level: input.level, questions: [...input.questions], createdAt: now, updatedAt: now }
}

export async function updateUniversalDeck(
  db: Firestore,
  id: string,
  data: Partial<Pick<UniversalDeck, "title" | "topicId" | "level" | "questions">>
): Promise<void> {
  const now = Date.now()
  await updateDoc(doc(db, "decks", id), { ...data, updatedAt: now })
}

export async function deleteUniversalDeck(db: Firestore, id: string): Promise<void> {
  await deleteDoc(doc(db, "decks", id))
}
