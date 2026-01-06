"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GameMode } from "@/types";
import { getDecks, Deck } from "@/lib/decks";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Play, Clock, CheckCircle, LogOut, LayoutDashboard, LogIn, Loader2, Gamepad2, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('join');
  const [loading, setLoading] = useState(false);

  // Join Form State
  const [joinCode, setJoinCode] = useState("");
  const [joinName, setJoinName] = useState("");

  // Create Form State
  const [hostName, setHostName] = useState("");
  const [gameMode, setGameMode] = useState<GameMode>('time');
  const [timeLimit, setTimeLimit] = useState(30);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState("");

  // Saved Session State
  const [savedSession, setSavedSession] = useState<{ code: string, name: string } | null>(null);

  useEffect(() => {
    async function loadDecks() {
      const loadedDecks = await getDecks(user?.uid);
      setDecks(loadedDecks);
      if (loadedDecks.length > 0 && !selectedDeckId) {
        setSelectedDeckId(loadedDecks[0].id);
      }
    }
    loadDecks();
  }, [user]);

  useEffect(() => {
    const code = localStorage.getItem("jw-game-room-code");
    const name = localStorage.getItem("jw-game-player-name");
    const id = localStorage.getItem("jw-game-player-id");
    if (code && name && id) {
      setSavedSession({ code, name });
    }
  }, []);

  const handleReconnect = () => {
    if (savedSession) {
      router.push(`/room/${savedSession.code}`);
    }
  };

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
        alert(data.error || "Erro ao entrar na sala");
        return;
      }
      localStorage.setItem("jw-game-player-id", data.playerId);
      localStorage.setItem("jw-game-player-name", joinName);
      localStorage.setItem("jw-game-room-code", data.room.code);
      router.push(`/room/${data.room.code}`);
    } catch (error) {
      console.error(error);
      alert("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

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
        alert(data.error || "Erro ao criar sala");
        return;
      }
      localStorage.setItem("jw-game-player-id", data.hostId);
      localStorage.setItem("jw-game-player-name", hostName);
      localStorage.setItem("jw-game-room-code", data.roomCode);
      router.push(`/room/${data.roomCode}`);
    } catch (error) {
      console.error(error);
      alert("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="absolute top-0 w-full p-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
           {/* Mobile Logo placeholder if needed */}
        </div>
        
        {user ? (
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 dark:bg-zinc-800/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 shadow-sm hover:scale-105 transition-all"
              title="Dashboard"
            >
              <LayoutDashboard className="w-5 h-5" />
            </Link>
            <button
              onClick={() => logout()}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 backdrop-blur-md border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 shadow-sm hover:scale-105 transition-all"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md rounded-full text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm border border-indigo-100 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 transition-all text-sm"
          >
            <LogIn className="w-4 h-4" />
            Login
          </Link>
        )}
      </header>

      <main className="w-full max-w-md space-y-6 z-10 pt-10">
        
        {/* Title Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20 mb-2">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            JW <span className="text-blue-600 dark:text-blue-400">Game</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
            Quiz Bíblico Interativo em Tempo Real
          </p>
        </motion.div>

        {/* Saved Session Alert */}
        <AnimatePresence>
          {savedSession && (
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
                   <span className="text-sm text-zinc-600 dark:text-zinc-300">Sala <strong>{savedSession.code}</strong> como <strong>{savedSession.name}</strong></span>
                </div>
                <button
                  onClick={handleReconnect}
                  className="w-full h-10 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 shadow-md transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" /> Continuar Jogando
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-zinc-900/90 backdrop-blur-xl rounded-3xl shadow-xl border border-zinc-200/60 dark:border-zinc-800 overflow-hidden ring-1 ring-zinc-900/5"
        >
          {/* Custom Tabs */}
          <div className="flex p-2 gap-2 bg-zinc-50/50 dark:bg-zinc-950/50 border-b border-zinc-100 dark:border-zinc-800/50">
            {(['join', 'create'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "relative flex-1 py-3 text-sm font-semibold rounded-xl transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  activeTab === tab ? "text-blue-700 dark:text-blue-300" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                )}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200/50 dark:border-zinc-700 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {tab === 'join' ? <Users className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4" />}
                  {tab === 'join' ? 'Entrar' : 'Criar Sala'}
                </span>
              </button>
            ))}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'join' ? (
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
                    <label htmlFor="joinName" className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">Seu Apelido</label>
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
                    <label htmlFor="code" className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">Código da Sala</label>
                    <input
                      id="code"
                      type="text" // Keep as text to allow leading zeros if needed, or customize keyboard
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
                      <>Entrar Agora <Play className="w-4 h-4 fill-current" /></>
                    )}
                  </button>
                </motion.form>
              ) : (
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
                    <label htmlFor="hostName" className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">Seu Apelido</label>
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
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">Escolha o Tema</label>
                    <div className="max-h-[180px] overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700">
                      {decks.map((deck) => (
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
                            <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{deck.title}</span>
                            {selectedDeckId === deck.id && <CheckCircle className="w-4 h-4 text-blue-500" />}
                          </div>
                          <p className="text-xs text-zinc-500 line-clamp-1">{deck.description}</p>
                          <div className="mt-2">
                             {deck.isGlobal ? (
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 px-2 py-1 rounded dark:bg-zinc-800 dark:text-zinc-400">Global</span>
                             ) : (
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-600 px-2 py-1 rounded dark:bg-indigo-900/30 dark:text-indigo-400">Pessoal</span>
                             )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">Modo de Jogo</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setGameMode('time')}
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-xl border text-sm transition-all h-24 justify-center",
                          gameMode === 'time'
                            ? "border-blue-500 bg-blue-50/50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 ring-1 ring-blue-500"
                            : "border-zinc-200 bg-white dark:bg-zinc-800/50 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        )}
                      >
                        <Clock className="w-6 h-6" />
                        <span className="font-medium">Com Tempo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setGameMode('all_answered')}
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-xl border text-sm transition-all h-24 justify-center",
                          gameMode === 'all_answered'
                            ? "border-blue-500 bg-blue-50/50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 ring-1 ring-blue-500"
                            : "border-zinc-200 bg-white dark:bg-zinc-800/50 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        )}
                      >
                        <CheckCircle className="w-6 h-6" />
                        <span className="font-medium">Sem Tempo</span>
                      </button>
                    </div>
                  </div>

                  {gameMode === 'time' && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-1.5 overflow-hidden"
                    >
                      <label htmlFor="timeLimit" className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">Segundos por Pergunta</label>
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
                      <>Criar Sala <Users className="w-4 h-4" /></>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
      
      {/* Footer simples */}
      <footer className="absolute bottom-2 text-center w-full p-2 z-10 opacity-40 text-[10px] text-zinc-500 dark:text-zinc-600">
         Jw Game v1.0 • Feito com ❤️
      </footer>
    </div>
  );
}