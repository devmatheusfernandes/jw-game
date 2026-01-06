import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Room } from "@/types";

export function useRoom(roomCode: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomCode) {
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(
      doc(db, "rooms", roomCode),
      (doc) => {
        if (doc.exists()) {
          setRoom(doc.data() as Room);
          setError(null);
        } else {
          setRoom(null);
          setError("Sala não encontrada");
        }
        setLoading(false);
      },
      (err) => {
        console.error("Erro ao ouvir sala:", err);
        setError("Erro de conexão");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [roomCode]);

  return { room, loading, error };
}
