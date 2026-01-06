import { Question } from "@/types";
import { db } from "./firebase";
import { collection, getDocs, query, where, addDoc, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";

export interface Deck {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  ownerId?: string;
  isGlobal?: boolean;
  createdAt?: number;
}

export async function getDecks(userId?: string): Promise<Deck[]> {
  const userDecks: Deck[] = [];
  const globalDecks: Deck[] = [];
  
  try {
    // Fetch global decks from Firestore
    const globalQ = query(collection(db, "decks"), where("isGlobal", "==", true));
    const globalSnapshot = await getDocs(globalQ);
    
    globalSnapshot.forEach((doc) => {
      globalDecks.push({ id: doc.id, ...doc.data() } as Deck);
    });

    // Fetch user decks if logged in
    if (userId) {
      const userQ = query(collection(db, "decks"), where("ownerId", "==", userId));
      const userSnapshot = await getDocs(userQ);
      
      userSnapshot.forEach((doc) => {
        userDecks.push({ id: doc.id, ...doc.data() } as Deck);
      });
    }
  } catch (error) {
    console.error("Error fetching decks:", error);
  }

  // Return user decks first, then global decks
  return [...userDecks, ...globalDecks];
}

export async function getGlobalDecks(): Promise<Deck[]> {
  const decks: Deck[] = [];
  try {
    const globalQ = query(collection(db, "decks"), where("isGlobal", "==", true));
    const globalSnapshot = await getDocs(globalQ);
    
    globalSnapshot.forEach((doc) => {
      decks.push({ id: doc.id, ...doc.data() } as Deck);
    });
  } catch (error) {
    console.error("Error fetching global decks:", error);
  }
  return decks;
}

export async function getUserDecks(userId: string): Promise<Deck[]> {
  const decks: Deck[] = [];
  try {
    const userQ = query(collection(db, "decks"), where("ownerId", "==", userId));
    const userSnapshot = await getDocs(userQ);
    
    userSnapshot.forEach((doc) => {
      decks.push({ id: doc.id, ...doc.data() } as Deck);
    });
  } catch (error) {
    console.error("Error fetching user decks:", error);
  }
  return decks;
}

export async function getDeckById(deckId: string): Promise<Deck | undefined> {
  // Check Firestore
  try {
    const deckRef = doc(db, "decks", deckId);
    const deckSnap = await getDoc(deckRef);
    
    if (deckSnap.exists()) {
      return { id: deckSnap.id, ...deckSnap.data() } as Deck;
    }
  } catch (error) {
    console.error("Error fetching deck:", error);
  }
  
  return undefined;
}

export async function saveDeck(deck: Omit<Deck, "id">, id?: string): Promise<string> {
  try {
    if (id) {
      await setDoc(doc(db, "decks", id), { ...deck, createdAt: Date.now() }, { merge: true });
      return id;
    } else {
      const docRef = await addDoc(collection(db, "decks"), { ...deck, createdAt: Date.now() });
      return docRef.id;
    }
  } catch (error) {
    console.error("Error saving deck:", error);
    throw error;
  }
}

export async function deleteDeck(deckId: string) {
    try {
        await deleteDoc(doc(db, "decks", deckId));
    } catch (error) {
        console.error("Error deleting deck:", error);
        throw error;
    }
}
