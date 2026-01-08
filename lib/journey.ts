import { db } from "./firebase";
import { 
    doc, getDoc, setDoc, updateDoc, arrayUnion, 
    collection, getDocs, query, orderBy, where, deleteDoc, addDoc, increment 
} from "firebase/firestore";
import { UserProgress, Deck, Stage, Badge } from "@/types/journey";
import { BADGES } from "@/lib/journey-constants";

const COLLECTION_NAME = "user_journey";
const STAGES_COLLECTION = "journey_stages";
const DECKS_COLLECTION = "journey_decks";

// --- Admin / Data Management ---

export async function getStages(): Promise<Stage[]> {
    try {
        const q = query(collection(db, STAGES_COLLECTION), orderBy("order", "asc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Stage));
    } catch (error) {
        console.error("Error fetching stages:", error);
        return [];
    }
}

export async function saveStage(stage: Partial<Stage>, id?: string): Promise<void> {
    try {
        if (id) {
            await setDoc(doc(db, STAGES_COLLECTION, id), stage, { merge: true });
        } else {
            const newDocRef = doc(collection(db, STAGES_COLLECTION));
            // const stageId = stage.id || newDocRef.id;
             if (stage.id) {
                 await setDoc(doc(db, STAGES_COLLECTION, stage.id), { ...stage, id: stage.id });
             } else {
                 await setDoc(newDocRef, { ...stage, id: newDocRef.id });
             }
        }
    } catch (error) {
        console.error("Error saving stage:", error);
        throw error;
    }
}

export async function deleteStage(stageId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, STAGES_COLLECTION, stageId));
    } catch (error) {
        console.error("Error deleting stage:", error);
        throw error;
    }
}

export async function getJourneyDecks(stageId?: string): Promise<Deck[]> {
    try {
        let q;
        if (stageId) {
            q = query(collection(db, DECKS_COLLECTION), where("stageId", "==", stageId), orderBy("order", "asc"));
        } else {
            q = query(collection(db, DECKS_COLLECTION), orderBy("order", "asc"));
        }
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deck));
    } catch (error) {
        console.error("Error fetching journey decks:", error);
        return [];
    }
}

export async function saveJourneyDeck(deck: Partial<Deck>, id?: string): Promise<void> {
    try {
        if (id) {
            await setDoc(doc(db, DECKS_COLLECTION, id), deck, { merge: true });
        } else {
            const newDocRef = doc(collection(db, DECKS_COLLECTION));
            // const deckId = deck.id || newDocRef.id;
            if (deck.id) {
                 await setDoc(doc(db, DECKS_COLLECTION, deck.id), { ...deck, id: deck.id });
            } else {
                 await setDoc(newDocRef, { ...deck, id: newDocRef.id });
            }
        }
    } catch (error) {
        console.error("Error saving journey deck:", error);
        throw error;
    }
}

export async function deleteJourneyDeck(deckId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, DECKS_COLLECTION, deckId));
    } catch (error) {
        console.error("Error deleting journey deck:", error);
        throw error;
    }
}


// --- User Progress ---

export async function getUserJourneyProgress(uid: string): Promise<UserProgress> {
  if (!uid) throw new Error("User ID is required");

  const docRef = doc(db, COLLECTION_NAME, uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    // Migration: ensure new fields exist
    if (data.totalScore === undefined) {
        const updates = {
            totalScore: 0,
            consecutiveCorrectAnswers: 0,
            streak: { count: 0, lastLoginDate: "" }
        };
        await updateDoc(docRef, updates);
        return { ...data, ...updates } as UserProgress;
    }
    return data as UserProgress;
  } else {
    // Initialize new user progress
    const stages = await getStages();
    const firstStageId = stages.length > 0 ? stages[0].id : "visitor";

    const initialProgress: UserProgress = {
      uid,
      currentStageId: firstStageId,
      completedDecks: [],
      earnedBadges: [],
      deckProgress: {},
      totalScore: 0,
      streak: { count: 1, lastLoginDate: new Date().toISOString().split('T')[0] },
      consecutiveCorrectAnswers: 0
    };
    await setDoc(docRef, initialProgress);
    return initialProgress;
  }
}

export async function saveDeckProgress(uid: string, deckId: string, questionIndex: number) {
  if (!uid) return;
  const docRef = doc(db, COLLECTION_NAME, uid);
  await updateDoc(docRef, {
    [`deckProgress.${deckId}`]: questionIndex,
  });
}

// Function to handle answer submission, update score, streak, and badges
export async function submitAnswer(uid: string, deckId: string, isCorrect: boolean, bonusPoints: number = 0): Promise<{ newBadges: Badge[] }> {
    if (!uid) return { newBadges: [] };
    const docRef = doc(db, COLLECTION_NAME, uid);
    const userProgress = await getUserJourneyProgress(uid);
    
    let updates: any = {};
    let newBadges: Badge[] = [];
    const earnedBadgeIds = new Set(userProgress.earnedBadges);

    // Check if deck is already completed
    const isDeckCompleted = userProgress.completedDecks.includes(deckId);

    // 1. Score & Consecutive Answers
    // Only award points if deck is NOT completed
    if (!isDeckCompleted) {
        if (isCorrect) {
            const points = 10 + bonusPoints;
            updates.totalScore = increment(points); // 10 base + bonus
            updates.consecutiveCorrectAnswers = increment(1);
            
            const currentCombo = (userProgress.consecutiveCorrectAnswers || 0) + 1;
            const currentScore = (userProgress.totalScore || 0) + points;

            // Check Combo Badges
            if (currentCombo === 5) checkBadge("combo-5", earnedBadgeIds, newBadges, updates);
            if (currentCombo === 10) checkBadge("combo-10", earnedBadgeIds, newBadges, updates);
            if (currentCombo === 20) checkBadge("combo-20", earnedBadgeIds, newBadges, updates);

            // Check Level Badges
            if (currentScore >= 1000) checkBadge("level-1000", earnedBadgeIds, newBadges, updates);
            if (currentScore >= 5000) checkBadge("level-5000", earnedBadgeIds, newBadges, updates);
            if (currentScore >= 10000) checkBadge("level-10000", earnedBadgeIds, newBadges, updates);

        } else {
            updates.consecutiveCorrectAnswers = 0;
        }
    }

    // 2. Streak Logic (Run on every answer or login, but here is fine for activity)
    const today = new Date().toISOString().split('T')[0];
    const lastLogin = userProgress.streak?.lastLoginDate;
    
    if (lastLogin !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        let newStreakCount = 1;

        if (lastLogin === yesterday) {
            newStreakCount = (userProgress.streak?.count || 0) + 1;
        } 
        
        updates.streak = {
            count: newStreakCount,
            lastLoginDate: today
        };

        // Check Streak Badges
        if (newStreakCount === 3) checkBadge("streak-3", earnedBadgeIds, newBadges, updates);
        if (newStreakCount === 7) checkBadge("streak-7", earnedBadgeIds, newBadges, updates);
        if (newStreakCount === 30) checkBadge("streak-30", earnedBadgeIds, newBadges, updates);
    }

    if (Object.keys(updates).length > 0) {
        await updateDoc(docRef, updates);
    }

    return { newBadges };
}

function checkBadge(badgeId: string, earnedIds: Set<string>, newBadges: Badge[], updates: any) {
    if (!earnedIds.has(badgeId)) {
        const badge = BADGES.find(b => b.id === badgeId);
        if (badge) {
            newBadges.push(badge);
            // We use arrayUnion in the actual update call if needed, but since we might add multiple
            // let's handle it carefully.
            // Firestore arrayUnion handles uniqueness.
            if (!updates.earnedBadges) updates.earnedBadges = arrayUnion(badgeId);
            else updates.earnedBadges = arrayUnion(...(updates.earnedBadges.value || []), badgeId); // simplified
        }
    }
}


export async function completeDeck(uid: string, deckId: string): Promise<{ newBadges: Badge[], unlockedStage?: Stage }> {
  if (!uid) throw new Error("User ID is required");
  
  const docRef = doc(db, COLLECTION_NAME, uid);
  const userProgress = await getUserJourneyProgress(uid);
  
  // Award completion points bonus?
  // Let's say 50 points for finishing a deck
  let updates: any = {};

  if (!userProgress.completedDecks.includes(deckId)) {
     updates.totalScore = increment(50);
     updates.completedDecks = arrayUnion(deckId);
  }
  
  updates[`deckProgress.${deckId}`] = 0; // Reset progress

  // Check for stage completion
  const allDecks = await getJourneyDecks(); 
  const allStages = await getStages();
  
  const deck = allDecks.find(d => d.id === deckId);
  let unlockedStage: Stage | undefined;
  let newBadges: Badge[] = [];
  const earnedBadgeIds = new Set(userProgress.earnedBadges);

  if (deck) {
    const currentStage = allStages.find(s => s.id === deck.stageId);
    if (currentStage) {
      const stageDecks = allDecks.filter(d => d.stageId === currentStage.id);
      const completedStageDecks = [...userProgress.completedDecks, deckId].filter(id => 
        stageDecks.some(d => d.id === id)
      );

      if (completedStageDecks.length === stageDecks.length) {
        // Stage Completed!
        const currentStageIndex = allStages.findIndex(s => s.id === currentStage.id);
        const nextStage = allStages[currentStageIndex + 1];
        
        if (nextStage) {
            updates.currentStageId = nextStage.id;
            unlockedStage = nextStage;
        }

        // Check Stage Badges
        if (currentStage.id === 'visitor') checkBadge("welcome-aboard", earnedBadgeIds, newBadges, updates);
        if (currentStage.id === 'first-meeting') checkBadge("first-steps", earnedBadgeIds, newBadges, updates);
      }
    }
  }
  
  // Check score badges again in case bonus pushed it over
  // This is a bit complex because we are using increment() for score.
  // Ideally we read the new score or calculate optimistic.
  // For simplicity, we skip re-checking score badges here, they will trigger on next answer.

  await updateDoc(docRef, updates);
  return { newBadges, unlockedStage };
}
