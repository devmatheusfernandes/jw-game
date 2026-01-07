import { db } from "@/lib/firebase";
import { Room } from "@/types";
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
    let updates: Partial<Room> = {};

    if (!roomData.isShowingResults) {
        // Step 1: Show Results
        updates = {
            isShowingResults: true
        };
    } else {
        // Step 2: Move to Next Question (and calculate scores)
        if (!currentQuestion) {
             // Emergency recovery: if index is bad, just finish or reset
             console.error("Current question undefined at index", roomData.currentQuestionIndex);
        }

        const players = roomData.players.map(player => {
            let newScore = player.score;
            // Only calculate if currentQuestion exists
            if (currentQuestion && player.currentAnswer === currentQuestion.correctAnswer) {
                let points = 10;

                if (roomData.settings.dynamicScoring && roomData.questionStartTime && player.answerTimestamp) {
                    const limitSeconds = currentQuestion.timeLimit || roomData.settings.timeLimitPerQuestion || 30;
                    const timeLimit = limitSeconds * 1000;
                    const elapsed = player.answerTimestamp - roomData.questionStartTime;
                    
                    // Ensure elapsed is valid
                    const safeElapsed = Math.max(0, Math.min(elapsed, timeLimit));
                    
                    // Calculate ratio (1.0 at start, 0.0 at end)
                    const ratio = 1 - (safeElapsed / timeLimit);
                    
                    // Points from 1000 down to 100
                    points = Math.round(100 + (900 * ratio));
                    
                    if (isNaN(points)) points = 10; // Safety fallback
                }

                newScore += points;
            }
            const updatedPlayer = {
                ...player,
                score: newScore,
                currentAnswer: null, // Reset for next question
            };
            delete updatedPlayer.answerTimestamp;
            return updatedPlayer;
        });

        const nextIndex = roomData.currentQuestionIndex + 1;
        updates = {
            players: players,
            currentQuestionIndex: nextIndex,
            questionStartTime: Date.now(),
            isShowingResults: false
        };

        if (nextIndex >= roomData.questions.length) {
            updates = {
                ...updates,
                status: 'finished',
                currentQuestionIndex: -1 // Or keep it at max? -1 to indicate done
            };
        }
    }

    await updateDoc(roomRef, updates as Record<string, unknown>);

    return NextResponse.json({ success: true, isShowingResults: updates.isShowingResults });
  } catch (error: any) {
    console.error("Error advancing game:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
