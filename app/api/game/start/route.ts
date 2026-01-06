import { db } from "@/lib/firebase";
import { Room, Question } from "@/types";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

// Sample questions for now - In a real app, fetch from a DB or allow host to select
const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: 'Qual é a capital do Brasil?',
    type: 'multiple_choice',
    options: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'],
    correctAnswer: 'Brasília',
    timeLimit: 20
  },
  {
    id: 'q2',
    text: 'O sol é uma estrela.',
    type: 'true_false',
    correctAnswer: true,
    timeLimit: 15
  },
  {
    id: 'q3',
    text: 'Quanto é 2 + 2?',
    type: 'multiple_choice',
    options: ['3', '4', '5', '22'],
    correctAnswer: '4',
    timeLimit: 15
  }
];

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

    // Start the game
    await updateDoc(roomRef, {
      status: 'playing',
      questions: SAMPLE_QUESTIONS,
      currentQuestionIndex: 0,
      questionStartTime: Date.now()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error starting game:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
