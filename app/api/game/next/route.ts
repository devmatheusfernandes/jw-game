import { db } from "@/lib/firebase";
import { Room, Player } from "@/types";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, hostId } = body;

    if (!code || !hostId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const roomRef = doc(db, "rooms", code);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const roomData = roomSnap.data() as Room;

    if (roomData.hostId !== hostId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const currentQuestion = roomData.questions[roomData.currentQuestionIndex];
    
    // Calculate Scores
    const players = roomData.players.map(player => {
        let newScore = player.score;
        if (player.currentAnswer === currentQuestion.correctAnswer) {
            newScore += 10; // Simple scoring
        }
        return {
            ...player,
            score: newScore,
            currentAnswer: null // Reset for next question
        };
    });

    const nextIndex = roomData.currentQuestionIndex + 1;
    let updates: any = {
        players: players,
        currentQuestionIndex: nextIndex,
        questionStartTime: Date.now()
    };

    if (nextIndex >= roomData.questions.length) {
        updates = {
            ...updates,
            status: 'finished',
            currentQuestionIndex: -1 // Or keep it at max? -1 to indicate done
        };
    }

    await updateDoc(roomRef, updates);

    return NextResponse.json({ success: true, finished: nextIndex >= roomData.questions.length });
  } catch (error) {
    console.error("Error advancing game:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
