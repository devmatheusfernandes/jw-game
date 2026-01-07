"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Users, CheckCircle, Clock, Search } from "lucide-react";
import { GameMode } from "@/types";
import { Deck, getDecks } from "@/lib/decks";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CreateGameFormProps {
  userId?: string;
}

export function CreateGameForm({ userId }: CreateGameFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Create Form State
  const [hostName, setHostName] = useState("");
  const [gameMode, setGameMode] = useState<GameMode>('time');
  const [timeLimit, setTimeLimit] = useState(30);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadDecks() {
      const loadedDecks = await getDecks(userId);
      setDecks(loadedDecks);
      if (loadedDecks.length > 0 && !selectedDeckId) {
        setSelectedDeckId(loadedDecks[0].id);
      }
    }
    loadDecks();
  }, [userId]);

  const filteredDecks = useMemo(() => {
    if (!searchTerm) return decks;
    const lowerTerm = searchTerm.toLowerCase();
    return decks.filter(
      (deck) =>
        deck.title.toLowerCase().includes(lowerTerm) ||
        deck.description.toLowerCase().includes(lowerTerm) ||
        (deck.categories || []).some(c => c.toLowerCase().includes(lowerTerm))
    );
  }, [decks, searchTerm]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/room/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hostName,
          deckId: selectedDeckId,
          settings: {
            mode: gameMode,
            timeLimitPerQuestion: timeLimit,
            showResultsAfterQuestion: true
          }
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erro ao criar sala");
        return;
      }
      localStorage.setItem("jw-game-player-id", data.hostId);
      localStorage.setItem("jw-game-player-name", hostName);
      localStorage.setItem("jw-game-room-code", data.roomCode);
      toast.success(`Sala ${data.roomCode} criada com sucesso!`);
      router.push(`/room/${data.roomCode}`);
    } catch (error) {
      console.error(error);
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      key="create"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      onSubmit={handleCreate}
      className="space-y-5"
    >
      <div className="space-y-1.5">
        <label htmlFor="hostName" className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">
          Seu Apelido
        </label>
        <input
          id="hostName"
          type="text"
          required
          value={hostName}
          onChange={(e) => setHostName(e.target.value)}
          className="w-full h-12 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          placeholder="Ex: Matheus"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between ml-1">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Escolha o Tema
          </label>
          <span className="text-xs text-zinc-400">
            {filteredDecks.length} {filteredDecks.length === 1 ? 'opção' : 'opções'}
          </span>
        </div>
        
        {/* Search Input */}
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text"
            placeholder="Buscar tema..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="max-h-[180px] overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700">
          {filteredDecks.length > 0 ? (
            filteredDecks.map((deck) => (
              <motion.div
                key={deck.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedDeckId(deck.id)}
                className={cn(
                  "p-3 rounded-xl border cursor-pointer transition-all text-left relative",
                  selectedDeckId === deck.id
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 ring-1 ring-blue-500"
                    : "border-zinc-200 bg-white dark:bg-zinc-800/50 dark:border-zinc-700 hover:border-zinc-300"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                    {deck.title}
                  </span>
                  {selectedDeckId === deck.id && (
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <p className="text-xs text-zinc-500 line-clamp-1">
                  {deck.description}
                </p>
                {deck.categories && deck.categories.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {deck.categories.slice(0, 3).map(cat => (
                      <span key={cat} className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-1 rounded dark:bg-blue-900/30 dark:text-blue-300">
                        {cat}
                      </span>
                    ))}
                    {deck.categories.length > 3 && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 px-2 py-1 rounded dark:bg-zinc-800 dark:text-zinc-400">
                        +{deck.categories.length - 3}
                      </span>
                    )}
                  </div>
                )}
                <div className="mt-2">
                  {deck.isGlobal ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 px-2 py-1 rounded dark:bg-zinc-800 dark:text-zinc-400">
                      Global
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-600 px-2 py-1 rounded dark:bg-indigo-900/30 dark:text-indigo-400">
                      Pessoal
                    </span>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
             <div className="py-8 text-center text-zinc-500 text-sm">
               Nenhum tema encontrado.
             </div>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">
          Modo de Jogo
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setGameMode("time")}
            className={cn(
              "flex flex-col items-center gap-2 p-3 rounded-xl border text-sm transition-all h-24 justify-center",
              gameMode === "time"
                ? "border-blue-500 bg-blue-50/50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 ring-1 ring-blue-500"
                : "border-zinc-200 bg-white dark:bg-zinc-800/50 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            )}
          >
            <Clock className="w-6 h-6" />
            <span className="font-medium">Com Tempo</span>
          </button>
          <button
            type="button"
            onClick={() => setGameMode("all_answered")}
            className={cn(
              "flex flex-col items-center gap-2 p-3 rounded-xl border text-sm transition-all h-24 justify-center",
              gameMode === "all_answered"
                ? "border-blue-500 bg-blue-50/50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 ring-1 ring-blue-500"
                : "border-zinc-200 bg-white dark:bg-zinc-800/50 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            )}
          >
            <CheckCircle className="w-6 h-6" />
            <span className="font-medium">Sem Tempo</span>
          </button>
        </div>
      </div>

      {gameMode === "time" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-1.5 overflow-hidden"
        >
          <label
            htmlFor="timeLimit"
            className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1"
          >
            Segundos por Pergunta
          </label>
          <div className="relative">
            <input
              id="timeLimit"
              type="number"
              min="5"
              max="300"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              className="w-full h-12 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
            />
            <span className="absolute right-4 top-3 text-zinc-400 text-sm">s</span>
          </div>
        </motion.div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 mt-2 flex justify-center items-center gap-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 shadow-lg shadow-indigo-600/20"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            Criar Sala <Users className="w-4 h-4" />
          </>
        )}
      </button>
    </motion.form>
  );
}
