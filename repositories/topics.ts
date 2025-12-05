import { addDoc, collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore"
import type { Firestore } from "firebase/firestore"
import type { Topic } from "@/types/collections"

export async function listTopics(db: Firestore): Promise<Topic[]> {
  const snap = await getDocs(collection(db, "topics"))
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Topic, "id">) }))
}

export async function createTopic(db: Firestore, name: string): Promise<Topic> {
  const ref = await addDoc(collection(db, "topics"), { name } as Omit<Topic, "id">)
  await updateDoc(ref, { id: ref.id })
  return { id: ref.id, name }
}

export async function updateTopicName(db: Firestore, id: string, name: string): Promise<void> {
  await updateDoc(doc(db, "topics", id), { name })
}

export async function deleteTopic(db: Firestore, id: string): Promise<void> {
  await deleteDoc(doc(db, "topics", id))
}
