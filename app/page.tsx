"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GameMode } from "@/types";
import { getDecks, Deck } from "@/lib/decks";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Play, Clock, CheckCircle, LogOut, LayoutDashboard, LogIn } from "lucide-react";
import Link from "next/link";

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

  // Saved Session State
  const [savedSession, setSavedSession] = useState<{code: string, name: string} | null>(null);

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

    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-zinc-900 dark:to-zinc-950 relative">
      <header className="absolute top-0 right-0 p-4 z-10">
        {user ? (
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-full text-zinc-700 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-800 shadow-sm transition-all border border-zinc-200 dark:border-zinc-700 text-sm font-medium"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <button 
              onClick={() => logout()}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm rounded-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 shadow-sm transition-all border border-zinc-200 dark:border-zinc-700 text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        ) : (
          <Link 
            href="/login"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600/90 backdrop-blur-sm rounded-full text-white hover:bg-indigo-700 shadow-sm transition-all text-sm font-medium"
          >
            <LogIn className="w-4 h-4" />
            Login
          </Link>
        )}
      </header>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-blue-600 dark:text-blue-400">JW Game</h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Quiz Bíblico em Tempo Real
            </p>
          </div>


        {savedSession && (
             <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-blue-200 dark:border-blue-900 mb-8 p-6 text-center animate-in fade-in slide-in-from-top-4">
                <p className="text-sm text-zinc-500 mb-4">Você estava jogando recentemente</p>
                <button 
                    onClick={handleReconnect}
                    className="w-full flex justify-center items-center gap-2 rounded-full bg-green-600 px-6 py-3 text-white font-bold hover:bg-green-700 shadow-lg transition-all hover:scale-105"
                >
                    <Play className="w-5 h-5" /> Continuar Jogo {savedSession.code}
                </button>
             </div>
        )}

        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
          <div className="flex border-b border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab('join')}
              className={cn(
                "flex-1 py-4 text-sm font-medium transition-colors",
                activeTab === 'join' 
                  ? "bg-blue-50/50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              )}
            >
              Entrar na Sala
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={cn(
                "flex-1 py-4 text-sm font-medium transition-colors",
                activeTab === 'create' 
                  ? "bg-blue-50/50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              )}
            >
              Criar Sala
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'join' ? (
              <form onSubmit={handleJoin} className="space-y-4">
                <div>
                  <label htmlFor="joinName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Seu Nome</label>
                  <input
                    id="joinName"
                    type="text"
                    required
                    value={joinName}
                    onChange={(e) => setJoinName(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                    placeholder="Ex: Matheus"
                  />
                </div>
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Código da Sala</label>
                  <input
                    id="code"
                    type="text"
                    required
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                    placeholder="Ex: 12345"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? "Entrando..." : (
                    <>
                      <Play className="w-4 h-4" /> Entrar
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label htmlFor="hostName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Seu Nome</label>
                  <input
                    id="hostName"
                    type="text"
                    required
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                    placeholder="Ex: Matheus"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Tema das Perguntas</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                    {decks.map((deck) => (
                      <div 
                        key={deck.id}
                        onClick={() => setSelectedDeckId(deck.id)}
                        className={cn(
                            "p-3 rounded-lg border cursor-pointer transition-all text-left",
                            selectedDeckId === deck.id 
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500" 
                                : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                        )}
                      >
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">
                          {deck.title}
                          {deck.isGlobal ? (
                             <span className="ml-2 text-[10px] uppercase tracking-wider bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded dark:bg-zinc-800 dark:text-zinc-400">Global</span>
                          ) : (
                             <span className="ml-2 text-[10px] uppercase tracking-wider bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded dark:bg-indigo-900/30 dark:text-indigo-400">Meu Deck</span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-500">{deck.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Modo de Jogo</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGameMode('time')}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-lg border text-sm transition-all",
                        gameMode === 'time'
                          ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                          : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                      )}
                    >
                      <Clock className="w-5 h-5" />
                      <span>Com Tempo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGameMode('all_answered')}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-lg border text-sm transition-all",
                        gameMode === 'all_answered'
                          ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                          : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                      )}
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Todos Responderem</span>
                    </button>
                  </div>
                </div>

                {gameMode === 'time' && (
                  <div>
                    <label htmlFor="timeLimit" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Tempo por Pergunta (segundos)</label>
                    <input
                      id="timeLimit"
                      type="number"
                      min="5"
                      max="300"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(Number(e.target.value))}
                      className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? "Criando..." : (
                    <>
                      <Users className="w-4 h-4" /> Criar Sala
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div></div>
  );
}
