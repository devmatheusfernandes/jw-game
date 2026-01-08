"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoom } from "@/hooks/useRoom";
import { Loader2, AlertCircle, XCircle, Crown } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { LobbyView } from "@/components/room/LobbyView";
import { GameView } from "@/components/room/GameView";
import { ResultsView } from "@/components/room/ResultsView";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { PlayersStatusBar } from "@/components/room/PlayersStatusBar";
import { SoundToggle } from "@/components/ui/SoundToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useSound } from "@/hooks/useSound";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const { room, loading, error } = useRoom(code);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const { play } = useSound();
  const prevStatusRef = useRef<string | null>(null);

  // Sound Effects Triggers
  useEffect(() => {
    if (room?.status) {
      if (prevStatusRef.current === 'waiting' && room.status === 'playing') {
        play('start');
      }
      prevStatusRef.current = room.status;
    }
  }, [room?.status, play]);

  useEffect(() => {
    const storedId = localStorage.getItem("jw-game-player-id");
    const storedName = localStorage.getItem("jw-game-player-name");
    if (!storedId) {
      router.push("/");
    } else {
      setPlayerId(storedId);
      setPlayerName(storedName);
    }
  }, [router]);

  // Timer Logic
  useEffect(() => {
    if (room?.status === 'playing' && room.questionStartTime && room.settings.timeLimitPerQuestion && !room.isShowingResults) {
      const interval = setInterval(() => {
        const elapsed = (Date.now() - room.questionStartTime!) / 1000;
        const remaining = Math.max(0, Math.ceil(room.settings.timeLimitPerQuestion - elapsed));
        setTimeLeft(remaining);

        if (remaining === 0) {
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [room?.status, room?.questionStartTime, room?.settings.timeLimitPerQuestion, room?.isShowingResults]);

  const handleStartGame = async () => {
    if (!playerId) return;
    try {
      await fetch("/api/game/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, hostId: playerId }),
      });
      toast.success("Jogo iniciado!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao iniciar o jogo");
    }
  };

  const handleAnswer = async (answer: string | boolean) => {
    if (!playerId || !room) return;
    setSubmitting(true);
    try {
      const currentQ = room.questions[room.currentQuestionIndex];
      await fetch("/api/game/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          playerId,
          answer,
          questionId: currentQ.id
        }),
      });
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar resposta");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!playerId) return;
    try {
      const res = await fetch("/api/game/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, hostId: playerId }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao avançar");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao avançar pergunta");
    }
  };

  const handleFinishGame = async () => {
    if (!playerId) return;
    try {
      await fetch("/api/game/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, hostId: playerId }),
      });
      toast.success("Jogo finalizado!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao finalizar o jogo");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <p className="text-zinc-500 text-sm animate-pulse">Sincronizando...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center flex-col gap-6 p-4 text-center bg-zinc-50 dark:bg-zinc-950">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-3xl border border-red-100 dark:border-red-800">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Sala não encontrada</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6">O código pode estar incorreto ou a sala foi encerrada.</p>
            <button onClick={() => router.push("/")} className="px-6 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium shadow-sm hover:bg-zinc-50 transition-colors w-full">
            Voltar ao Início
            </button>
        </div>
      </div>
    );
  }

  const isHost = room.hostId === playerId;
  const currentPlayer = room.players.find(p => p.id === playerId);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex flex-col relative overflow-hidden">
        
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-400/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Fixo */}
      <header className="sticky top-0 z-50 px-4 py-3 backdrop-blur-md bg-white/70 dark:bg-zinc-900/80 border-b border-zinc-200/50 dark:border-zinc-800 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-blue-600/20">
                JW
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Sala</span>
                <span className="text-sm font-bold text-zinc-900 dark:text-white leading-none font-mono">{room.code}</span>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <SoundToggle />
            <ThemeToggle />
            {isHost && (room.status === 'playing' || room.status === 'waiting') && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="hidden sm:flex h-8">
                            <XCircle className="w-4 h-4 mr-2" />
                            {room.status === 'waiting' ? 'Encerrar' : 'Finalizar'}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" className="sm:hidden h-8 w-8">
                            <XCircle className="w-4 h-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {room.status === 'waiting' ? 'Encerrar a sala?' : 'Finalizar o jogo?'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {room.status === 'waiting' 
                                    ? 'Tem certeza que deseja encerrar a sala? Todos os jogadores serão desconectados.' 
                                    : 'Tem certeza que deseja finalizar o jogo agora? Todos os jogadores serão levados para a tela de resultados.'}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleFinishGame} className="bg-red-600 hover:bg-red-700">
                                {room.status === 'waiting' ? 'Encerrar' : 'Finalizar'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            <div className="flex items-center gap-3 bg-zinc-100/50 dark:bg-zinc-800/50 px-3 py-1.5 rounded-full border border-zinc-200/50 dark:border-zinc-700">
                <UserAvatar playerName={playerName || ""} className="h-6 w-6" />
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 max-w-[80px] truncate flex items-center gap-1">
                    {isHost && <Crown className="w-3 h-3 text-yellow-500" />}
                    {playerName}
                </span>
            </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto p-4 flex flex-col justify-center z-10">
        
        {room.status === 'playing' && (
           <PlayersStatusBar players={room.players} />
        )}

        <AnimatePresence mode="wait">
            
            {/* LOBBY VIEW */}
            {room.status === 'waiting' && (
                <LobbyView 
                    room={room} 
                    isHost={isHost} 
                    onStartGame={handleStartGame} 
                />
            )}

            {/* GAME VIEW */}
            {room.status === 'playing' && room.questions[room.currentQuestionIndex] && (
                <GameView 
                    room={room}
                    currentPlayer={currentPlayer}
                    timeLeft={timeLeft}
                    isHost={isHost}
                    onAnswer={handleAnswer}
                    onNextQuestion={handleNextQuestion}
                />
            )}

            {/* RESULTS VIEW */}
            {room.status === 'finished' && (
                <ResultsView 
                    room={room} 
                    currentPlayer={currentPlayer} 
                />
            )}
        </AnimatePresence>
      </main>
    </div>
  );
}
