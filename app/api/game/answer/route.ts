import { db } from "@/lib/firebase";
import { Room } from "@/types";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, playerId, answer, questionId } = body;

    if (!code || !playerId || answer === undefined) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const roomRef = doc(db, "rooms", code);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const roomData = roomSnap.data() as Room;

    // Validate if game is playing
    if (roomData.status !== 'playing') {
      return NextResponse.json({ error: "Game not active" }, { status: 400 });
    }

    const currentQuestion = roomData.questions[roomData.currentQuestionIndex];
    if (currentQuestion.id !== questionId) {
        // Late answer or wrong question
        return NextResponse.json({ error: "Question expired or invalid" }, { status: 400 });
    }

    // Find player index
    const playerIndex = roomData.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const players = [...roomData.players];
    const player = players[playerIndex];

    // Avoid double answering
    if (player.currentAnswer !== undefined && player.currentAnswer !== null) {
         return NextResponse.json({ success: true, message: "Already answered" });
    }

    // Record answer
    player.currentAnswer = answer;
    player.answerTimestamp = Date.now();
    
    // Check correctness (simple check, ideally do this on "reveal" or accumulate score)
    // For now, let's just store the answer. Scoring happens at the end of question time or when all answer.
    
    // Update players array
    players[playerIndex] = player;

    await updateDoc(roomRef, {
      players: players
    });

    // Check if all players answered
    const allAnswered = players.every(p => p.currentAnswer !== undefined && p.currentAnswer !== null);
    
    if (allAnswered && roomData.settings.mode === 'all_answered') {
        // Trigger next step logic here or let client/host trigger "Reveal"
        // For simplicity, we just save state.
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error submitting answer:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
