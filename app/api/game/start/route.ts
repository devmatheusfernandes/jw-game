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

    if (!roomData.questions || roomData.questions.length === 0) {
       return NextResponse.json({ error: "A sala não possui perguntas." }, { status: 400 });
    }

    // Start the game
    await updateDoc(roomRef, {
      status: 'playing',
      currentQuestionIndex: 0,
      questionStartTime: Date.now()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error starting game:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
