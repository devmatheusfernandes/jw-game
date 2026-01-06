"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoom } from "@/hooks/useRoom";
import { cn } from "@/lib/utils";
import { Loader2, Play, Clock, Trophy, Medal, Crown, Home, Copy, Check, Users, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const { room, loading, error } = useRoom(code);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

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
    if (room?.status === 'playing' && room.questionStartTime && room.settings.timeLimitPerQuestion) {
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
  }, [room?.status, room?.questionStartTime, room?.settings.timeLimitPerQuestion]);

  const handleStartGame = async () => {
    if (!playerId) return;
    try {
      await fetch("/api/game/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, hostId: playerId }),
      });
    } catch (err) {
      console.error(err);
      alert("Erro ao iniciar o jogo");
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
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!playerId) return;
    try {
      await fetch("/api/game/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, hostId: playerId }),
      });
    } catch (err) {
      console.error(err);
      alert("Erro ao avançar pergunta");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
  const allAnswered = room.players.every(p => p.currentAnswer !== undefined && p.currentAnswer !== null);
  const isTimeUp = room.settings.mode === 'time' && timeLeft === 0;

  const showNextButton = isHost && (allAnswered || isTimeUp || room.isShowingResults);
  const areOptionsDisabled = (currentPlayer?.currentAnswer !== undefined && currentPlayer?.currentAnswer !== null) || isTimeUp || room.isShowingResults;
  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);

  // Calcula porcentagem do tempo para a barra de progresso
  const timePercentage = room.settings.timeLimitPerQuestion && timeLeft !== null 
    ? (timeLeft / room.settings.timeLimitPerQuestion) * 100 
    : 100;

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
        <div className="flex items-center gap-3 bg-zinc-100/50 dark:bg-zinc-800/50 px-3 py-1.5 rounded-full border border-zinc-200/50 dark:border-zinc-700">
            <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                {playerName?.[0]?.toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 max-w-[80px] truncate">{playerName}</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto p-4 flex flex-col justify-center z-10">
        <AnimatePresence mode="wait">
            
            {/* LOBBY VIEW */}
            {room.status === 'waiting' && (
                <motion.div 
                    key="lobby"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="flex flex-col gap-6"
                >
                    <div className="text-center space-y-2">
                        <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
                            Aguardando Início
                        </span>
                        <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Prepare-se!</h2>
                        <p className="text-zinc-500 dark:text-zinc-400">Convide seus amigos para entrar.</p>
                    </div>

                    {/* Room Code Card */}
                    <div 
                        onClick={copyToClipboard}
                        className="bg-white dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-blue-100 dark:border-blue-900/30 flex flex-col items-center gap-2 cursor-pointer group hover:scale-[1.02] transition-transform"
                    >
                         <span className="text-xs text-zinc-400 font-medium">CÓDIGO DA SALA</span>
                         <div className="flex items-center gap-3">
                            <span className="text-5xl font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                                {room.code}
                            </span>
                         </div>
                         <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 group-hover:text-blue-500 transition-colors">
                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copied ? "Copiado!" : "Toque para copiar"}
                         </div>
                    </div>

                    {/* Players Grid */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                                <Users className="w-4 h-4" /> Jogadores ({room.players.length})
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {room.players.map((player) => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    key={player.id} 
                                    className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 shadow-sm"
                                >
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                        {player.name[0].toUpperCase()}
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">{player.name}</span>
                                        {player.isHost && <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">Anfitrião</span>}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {isHost ? (
                        <button
                            onClick={handleStartGame}
                            className="w-full mt-4 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <Play className="w-5 h-5 fill-current" /> Iniciar Jogo
                        </button>
                    ) : (
                        <div className="mt-4 p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-center text-sm text-zinc-500 animate-pulse">
                            O anfitrião iniciará a partida em breve...
                        </div>
                    )}
                </motion.div>
            )}

            {/* GAME VIEW */}
            {room.status === 'playing' && room.questions[room.currentQuestionIndex] && (
                <motion.div
                    key="game"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col h-full gap-4"
                >
                     {/* Progress & Timer */}
                    <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex justify-between items-center text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                             <span>Questão {room.currentQuestionIndex + 1}/{room.questions.length}</span>
                             {timeLeft !== null && <span className={cn(timeLeft < 10 ? "text-red-500" : "text-zinc-500")}>{timeLeft}s</span>}
                        </div>
                        {/* Timer Bar */}
                        <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                             <motion.div 
                                className={cn(
                                    "h-full rounded-full transition-colors",
                                    timeLeft !== null && timeLeft < 10 ? "bg-red-500" : "bg-blue-500"
                                )}
                                animate={{ width: `${timePercentage}%` }}
                                transition={{ ease: "linear", duration: 1 }}
                             />
                        </div>
                    </div>

                    {/* Question Card */}
                    <div className="flex-1 flex flex-col justify-center">
                         <motion.div 
                             key={room.currentQuestionIndex}
                             initial={{ opacity: 0, x: 20 }}
                             animate={{ opacity: 1, x: 0 }}
                             className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-xl border border-zinc-100 dark:border-zinc-800 min-h-[180px] flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden"
                         >
                            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500" />
                            <h2 className="text-xl sm:text-2xl font-bold text-zinc-800 dark:text-zinc-100 leading-snug">
                                {room.questions[room.currentQuestionIndex].text}
                            </h2>
                            {room.isShowingResults && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg text-sm font-bold"
                                >
                                    Resposta: {String(room.questions[room.currentQuestionIndex].correctAnswer)}
                                </motion.div>
                            )}
                         </motion.div>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
                        {(room.questions[room.currentQuestionIndex].type === 'multiple_choice' 
                            ? room.questions[room.currentQuestionIndex].options 
                            : [true, false]
                        )?.map((option, idx) => {
                            const val = option;
                            const isSelected = currentPlayer?.currentAnswer === val;
                            const isCorrect = val === room.questions[room.currentQuestionIndex].correctAnswer;
                            
                            let stateStyle = "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20";
                            
                            if (room.isShowingResults) {
                                if (isCorrect) stateStyle = "bg-green-500 text-white border-green-600 shadow-green-500/30 shadow-lg ring-2 ring-green-500 ring-offset-2 dark:ring-offset-zinc-950";
                                else if (isSelected) stateStyle = "bg-red-500 text-white border-red-600 opacity-60";
                                else stateStyle = "bg-zinc-100 dark:bg-zinc-800 border-transparent opacity-40";
                            } else if (isSelected) {
                                stateStyle = "bg-blue-600 text-white border-blue-700 shadow-lg shadow-blue-600/20 ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-zinc-950 scale-[1.02]";
                            } else if (areOptionsDisabled) {
                                stateStyle = "bg-zinc-100 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 opacity-50 cursor-not-allowed";
                            }

                            return (
                                <motion.button
                                    key={idx}
                                    onClick={() => handleAnswer(val)}
                                    disabled={areOptionsDisabled}
                                    whileTap={!areOptionsDisabled ? { scale: 0.98 } : {}}
                                    className={cn(
                                        "relative p-4 rounded-2xl border-2 text-left transition-all duration-200 flex items-center justify-between group h-20 sm:h-24",
                                        stateStyle
                                    )}
                                >
                                    <span className={cn(
                                        "font-semibold text-lg",
                                        (isSelected || (room.isShowingResults && isCorrect)) ? "text-white" : "text-zinc-700 dark:text-zinc-300"
                                    )}>
                                        {String(val) === "true" ? "Verdadeiro" : String(val) === "false" ? "Falso" : val}
                                    </span>
                                    {isSelected && !room.isShowingResults && (
                                        <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Footer Actions */}
                    <div className="min-h-[60px] flex items-center justify-center">
                        {showNextButton && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={handleNextQuestion}
                                className={cn(
                                    "px-8 py-3 rounded-xl font-bold text-white shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95",
                                    room.isShowingResults ? "bg-green-600 hover:bg-green-700 shadow-green-600/30" : "bg-zinc-800 hover:bg-zinc-900 shadow-zinc-900/30"
                                )}
                            >
                                {room.isShowingResults ? "Próxima Pergunta" : "Ver Resultados"} <Play className="w-4 h-4 fill-current" />
                            </motion.button>
                        )}
                        {!isHost && !room.isShowingResults && currentPlayer?.currentAnswer && (
                             <span className="text-sm font-medium text-zinc-500 animate-pulse">Aguardando outros jogadores...</span>
                        )}
                    </div>

                </motion.div>
            )}

            {/* FINISHED VIEW - PODIUM */}
            {room.status === 'finished' && (
                <motion.div
                    key="finished"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-6"
                >
                    <div className="text-center mb-8">
                        <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-2 animate-bounce" />
                        <h2 className="text-4xl font-black text-zinc-900 dark:text-white">Fim de Jogo!</h2>
                        <p className="text-zinc-500">Confira quem mandou bem</p>
                    </div>

                    {/* PODIUM */}
                    <div className="flex items-end justify-center gap-3 sm:gap-6 h-[300px] w-full max-w-md mb-8 px-4">
                        
                        {/* 2nd Place */}
                        {room.players.length >= 2 && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                transition={{ delay: 0.5, type: "spring" }}
                                className="flex-1 flex flex-col items-center justify-end"
                            >
                                <div className="mb-2 flex flex-col items-center">
                                    <div className="h-14 w-14 rounded-full border-4 border-slate-300 bg-zinc-200 text-slate-600 font-bold flex items-center justify-center shadow-lg relative z-10">
                                        {sortedPlayers[1].name[0].toUpperCase()}
                                        <div className="absolute -bottom-2 bg-slate-400 text-white text-[10px] px-1.5 rounded-full">2º</div>
                                    </div>
                                    <span className="text-xs font-bold mt-1 text-slate-600 dark:text-slate-400 truncate max-w-[80px]">{sortedPlayers[1].name}</span>
                                </div>
                                <div className="w-full h-32 bg-slate-200 dark:bg-slate-700/50 rounded-t-xl border-t-4 border-slate-300 flex items-end justify-center pb-2 shadow-inner">
                                    <span className="font-mono font-bold text-slate-400">{sortedPlayers[1].score}</span>
                                </div>
                            </motion.div>
                        )}

                        {/* 1st Place */}
                        {room.players.length >= 1 && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                transition={{ delay: 1, type: "spring" }}
                                className="flex-1 flex flex-col items-center justify-end"
                            >
                                <Crown className="w-8 h-8 text-yellow-400 mb-1 animate-pulse" />
                                <div className="mb-2 flex flex-col items-center">
                                    <div className="h-20 w-20 rounded-full border-4 border-yellow-400 bg-yellow-100 text-yellow-700 font-bold text-2xl flex items-center justify-center shadow-xl shadow-yellow-500/20 relative z-10">
                                        {sortedPlayers[0].name[0].toUpperCase()}
                                        <div className="absolute -bottom-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">1º</div>
                                    </div>
                                    <span className="text-sm font-bold mt-2 text-yellow-700 dark:text-yellow-400 truncate max-w-[100px]">{sortedPlayers[0].name}</span>
                                </div>
                                <div className="w-full h-48 bg-gradient-to-t from-yellow-200 to-yellow-100 dark:from-yellow-900/40 dark:to-yellow-800/20 rounded-t-xl border-t-4 border-yellow-400 flex items-end justify-center pb-4 shadow-inner">
                                    <span className="font-mono font-black text-2xl text-yellow-600 dark:text-yellow-500">{sortedPlayers[0].score}</span>
                                </div>
                            </motion.div>
                        )}

                        {/* 3rd Place */}
                        {room.players.length >= 3 && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                transition={{ delay: 0.7, type: "spring" }}
                                className="flex-1 flex flex-col items-center justify-end"
                            >
                                <div className="mb-2 flex flex-col items-center">
                                    <div className="h-14 w-14 rounded-full border-4 border-orange-300 bg-orange-100 text-orange-700 font-bold flex items-center justify-center shadow-lg relative z-10">
                                        {sortedPlayers[2].name[0].toUpperCase()}
                                        <div className="absolute -bottom-2 bg-orange-400 text-white text-[10px] px-1.5 rounded-full">3º</div>
                                    </div>
                                    <span className="text-xs font-bold mt-1 text-orange-600 dark:text-orange-400 truncate max-w-[80px]">{sortedPlayers[2].name}</span>
                                </div>
                                <div className="w-full h-24 bg-orange-100 dark:bg-orange-900/30 rounded-t-xl border-t-4 border-orange-300 flex items-end justify-center pb-2 shadow-inner">
                                    <span className="font-mono font-bold text-orange-400">{sortedPlayers[2].score}</span>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Rest of Players List */}
                    {room.players.length > 3 && (
                        <div className="w-full max-w-md bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                             {sortedPlayers.slice(3).map((player, idx) => (
                                 <div key={player.id} className="flex items-center justify-between p-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                                     <div className="flex items-center gap-3">
                                         <span className="text-zinc-400 font-mono text-sm w-6 text-center">{idx + 4}</span>
                                         <span className="font-medium text-zinc-700 dark:text-zinc-300">{player.name}</span>
                                     </div>
                                     <span className="font-mono text-zinc-500 font-bold">{player.score}</span>
                                 </div>
                             ))}
                        </div>
                    )}

                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5 }}
                        onClick={() => {
                            localStorage.removeItem("jw-game-room-code");
                            router.push("/");
                        }}
                        className="mt-8 px-8 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                    >
                        <Home className="w-4 h-4" /> Voltar ao Início
                    </motion.button>
                </motion.div>
            )}

        </AnimatePresence>
      </main>
    </div>
  );
}