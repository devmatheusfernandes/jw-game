"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Play } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface SavedSessionAlertProps {
  savedSession: { code: string; name: string } | null;
  onReconnect: () => void;
}

export function SavedSessionAlert({ savedSession, onReconnect }: SavedSessionAlertProps) {
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    async function checkSession() {
      if (!savedSession) {
        setIsValid(false);
        return;
      }

      try {
        const roomRef = doc(db, "rooms", savedSession.code);
        const roomSnap = await getDoc(roomRef);

        if (roomSnap.exists()) {
          const roomData = roomSnap.data();
          if (roomData.status !== 'finished') {
            setIsValid(true);
          } else {
            // Remove dados se a sala já finalizou
            localStorage.removeItem("jw-game-room-code");
            localStorage.removeItem("jw-game-player-name");
            localStorage.removeItem("jw-game-player-id");
            setIsValid(false);
          }
        } else {
          // Remove dados se a sala não existe
          localStorage.removeItem("jw-game-room-code");
          localStorage.removeItem("jw-game-player-name");
          localStorage.removeItem("jw-game-player-id");
          setIsValid(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setIsValid(false);
      }
    }

    checkSession();
  }, [savedSession]);

  return (
    <AnimatePresence>
      {isValid && savedSession && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-emerald-50/80 dark:bg-emerald-900/20 backdrop-blur-sm rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/50 shadow-sm"
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Sessão Encontrada</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600 dark:text-zinc-300">
                Sala <strong>{savedSession.code}</strong> como <strong>{savedSession.name}</strong>
              </span>
            </div>
            <button
              onClick={onReconnect}
              className="w-full h-10 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 shadow-md transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" /> Continuar Jogando
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
