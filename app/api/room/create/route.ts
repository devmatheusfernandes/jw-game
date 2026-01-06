import { db } from "@/lib/firebase";
import { generateRoomCode, generateUUID } from "@/lib/utils";
import { Room, Player } from "@/types";
import { doc, setDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { hostName, settings } = body;

    if (!hostName) {
      return NextResponse.json({ error: "Host name is required" }, { status: 400 });
    }

    const roomCode = generateRoomCode();
    const hostId = generateUUID();

    const hostPlayer: Player = {
      id: hostId,
      name: hostName,
      score: 0,
      isHost: true,
      connected: true,
    };

    const newRoom: Room = {
      code: roomCode,
      hostId,
      status: 'waiting',
      players: [hostPlayer],
      questions: [], // Questions will be added later or selected from a preset
      currentQuestionIndex: -1,
      settings: settings || {
        mode: 'time',
        timeLimitPerQuestion: 30,
        showResultsAfterQuestion: true
      },
      createdAt: Date.now(),
    };

    // Save to Firestore
    await setDoc(doc(db, "rooms", roomCode), newRoom);

    return NextResponse.json({ roomCode, hostId, room: newRoom });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
