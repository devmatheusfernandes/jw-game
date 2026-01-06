import { db } from "@/lib/firebase";
import { generateUUID } from "@/lib/utils";
import { Room, Player } from "@/types";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, playerName } = body;

    if (!code || !playerName) {
      return NextResponse.json({ error: "Code and Player Name are required" }, { status: 400 });
    }

    const roomRef = doc(db, "rooms", code);
    const roomSnap = await getDoc(roomRef);

    if (!roomSnap.exists()) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const roomData = roomSnap.data() as Room;

    if (roomData.status !== 'waiting') {
      return NextResponse.json({ error: "Game already started" }, { status: 400 });
    }

    // Check if name is taken (optional, but good UX)
    if (roomData.players.some(p => p.name.toLowerCase() === playerName.toLowerCase())) {
      // Allow rejoin? For now, just reject duplicate names
      return NextResponse.json({ error: "Name already taken" }, { status: 400 });
    }

    const playerId = generateUUID();
    const newPlayer: Player = {
      id: playerId,
      name: playerName,
      score: 0,
      isHost: false,
      connected: true,
    };

    await updateDoc(roomRef, {
      players: arrayUnion(newPlayer)
    });

    return NextResponse.json({ playerId, room: roomData });
  } catch (error) {
    console.error("Error joining room:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
