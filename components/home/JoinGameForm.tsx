"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Play } from "lucide-react";
import { toast } from "sonner";

export function JoinGameForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinName, setJoinName] = useState("");

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/room/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode, playerName: joinName }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erro ao entrar na sala");
        return;
      }
      localStorage.setItem("jw-game-player-id", data.playerId);
      localStorage.setItem("jw-game-player-name", joinName);
      localStorage.setItem("jw-game-room-code", data.room.code);
      toast.success(`Entrando na sala ${data.room.code}...`);
      router.push(`/room/${data.room.code}`);
    } catch (error) {
      console.error(error);
      toast.error("Erro de conexão. Verifique sua internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      key="join"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      onSubmit={handleJoin}
      className="space-y-5"
    >
      <div className="space-y-1.5">
        <label htmlFor="joinName" className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">
          Seu Apelido
        </label>
        <input
          id="joinName"
          type="text"
          required
          value={joinName}
          onChange={(e) => setJoinName(e.target.value)}
          className="w-full h-12 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          placeholder="Ex: Matheus"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="code" className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">
          Código da Sala
        </label>
        <input
          id="code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          required
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          className="w-full h-12 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono tracking-widest text-lg"
          placeholder="00000"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 mt-2 flex justify-center items-center gap-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 shadow-lg shadow-blue-600/20"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            Entrar Agora <Play className="w-4 h-4 fill-current" />
          </>
        )}
      </button>
    </motion.form>
  );
}
