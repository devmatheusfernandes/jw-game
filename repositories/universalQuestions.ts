import { addDoc, collection, updateDoc, getDocs, query, where } from "firebase/firestore"
import type { Firestore } from "firebase/firestore"
import type { UniversalQuestion } from "@/types/collections"

export async function createUniversalQuestion(
  db: Firestore,
  input: Omit<UniversalQuestion, "id" | "createdAt" | "updatedAt">
): Promise<UniversalQuestion> {
  const now = Date.now()
  const ref = await addDoc(collection(db, "questions"), { ...input, createdAt: now, updatedAt: now } as Omit<UniversalQuestion, "id">)
  await updateDoc(ref, { id: ref.id })
  return { id: ref.id, ...(input as Omit<UniversalQuestion, "id">), createdAt: now, updatedAt: now }
}

export async function listUniversalQuestions(db: Firestore): Promise<UniversalQuestion[]> {
  const snap = await getDocs(collection(db, "questions"))
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<UniversalQuestion, "id">) }))
}

export async function listUniversalQuestionsByTopic(db: Firestore, topicId: string): Promise<UniversalQuestion[]> {
  const q = query(collection(db, "questions"), where("topicId", "==", topicId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<UniversalQuestion, "id">) }))
}
