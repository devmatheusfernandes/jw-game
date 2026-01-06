"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoom } from "@/hooks/useRoom";
import { cn } from "@/lib/utils";
import { Loader2, Play, Clock } from "lucide-react";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const { room, loading, error } = useRoom(code);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

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
            // Time is up
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="flex min-h-screen items-center justify-center flex-col gap-4">
        <h1 className="text-2xl font-bold text-red-600">Sala não encontrada</h1>
        <button onClick={() => router.push("/")} className="text-blue-600 hover:underline">
          Voltar ao Início
        </button>
      </div>
    );
  }

  const isHost = room.hostId === playerId;
  const currentPlayer = room.players.find(p => p.id === playerId);
  const allAnswered = room.players.every(p => p.currentAnswer !== undefined && p.currentAnswer !== null);
  const isTimeUp = room.settings.mode === 'time' && timeLeft === 0;
  
  const showNextButton = isHost && (allAnswered || isTimeUp || room.isShowingResults);
  const areOptionsDisabled = (currentPlayer?.currentAnswer !== undefined && currentPlayer?.currentAnswer !== null) || isTimeUp || room.isShowingResults;

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Sala: {room.code}</h1>
          <p className="text-sm text-zinc-500">Jogadores: {room.players.length}</p>
        </div>
        <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold">
                {playerName?.[0]?.toUpperCase()}
            </div>
            <span className="text-sm font-medium hidden sm:inline-block">{playerName}</span>
        </div>
      </header>

      {/* Lobby View */}
      {room.status === 'waiting' && (
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-sm text-center">
            <h2 className="text-3xl font-bold mb-2">Aguardando Jogadores...</h2>
            <p className="text-zinc-500 mb-8">Compartilhe o código <span className="font-mono font-bold text-lg text-blue-600 bg-blue-50 px-2 py-1 rounded">{room.code}</span></p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              {room.players.map((player) => (
                <div key={player.id} className="flex flex-col items-center gap-2 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xl">
                    {player.name[0].toUpperCase()}
                  </div>
                  <span className="font-medium truncate w-full text-center">{player.name}</span>
                  {player.isHost && <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Host</span>}
                </div>
              ))}
            </div>

            {isHost ? (
              <button
                onClick={handleStartGame}
                className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <Play className="w-5 h-5" /> Iniciar Jogo
              </button>
            ) : (
              <p className="text-zinc-500 animate-pulse">Aguardando o anfitrião iniciar...</p>
            )}
          </div>
        </div>
      )}

      {/* Game View */}
      {room.status === 'playing' && (
        <div className="max-w-3xl mx-auto">
            {room.currentQuestionIndex >= 0 && room.questions[room.currentQuestionIndex] ? (
                <div className="space-y-6">
                     {/* Timer & Progress */}
                     <div className="flex justify-between items-center text-sm font-medium text-zinc-500">
                        <span>Pergunta {room.currentQuestionIndex + 1} de {room.questions.length}</span>
                        {room.settings.mode === 'time' && timeLeft !== null && (
                            <div className={cn("flex items-center gap-2", timeLeft < 10 ? "text-red-600" : "text-zinc-700")}>
                                <Clock className="w-4 h-4" />
                                <span>{timeLeft}s</span>
                            </div>
                        )}
                     </div>

                     {/* Question Card */}
                     <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-lg text-center min-h-[200px] flex items-center justify-center flex-col gap-4">
                        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-800 dark:text-zinc-100">
                            {room.questions[room.currentQuestionIndex].text}
                        </h2>
                        {room.isShowingResults && (
                             <div className="text-lg font-medium text-zinc-500">
                                 Resposta Correta: <span className="text-green-600 font-bold">{String(room.questions[room.currentQuestionIndex].correctAnswer)}</span>
                             </div>
                        )}
                     </div>

                     {/* Options */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {room.questions[room.currentQuestionIndex].type === 'multiple_choice' ? (
                            room.questions[room.currentQuestionIndex].options?.map((option, idx) => {
                                const isSelected = currentPlayer?.currentAnswer === option;
                                const isCorrect = option === room.questions[room.currentQuestionIndex].correctAnswer;
                                
                                let buttonClass = "bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 shadow-sm";
                                if (room.isShowingResults) {
                                    if (isCorrect) buttonClass = "bg-green-600 text-white shadow-md ring-2 ring-green-600 ring-offset-2 dark:ring-offset-zinc-950";
                                    else if (isSelected) buttonClass = "bg-red-500 text-white opacity-80";
                                    else buttonClass = "bg-zinc-100 dark:bg-zinc-800 opacity-50";
                                } else if (isSelected) {
                                    buttonClass = "bg-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-zinc-950";
                                } else if (areOptionsDisabled) {
                                     buttonClass = "bg-zinc-200 dark:bg-zinc-800 opacity-50 cursor-not-allowed";
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(option)}
                                        disabled={areOptionsDisabled}
                                        className={cn(
                                            "p-6 rounded-xl text-lg font-medium transition-all transform",
                                            !areOptionsDisabled && "hover:scale-[1.02] active:scale-[0.98]",
                                            buttonClass
                                        )}
                                    >
                                        {option}
                                    </button>
                                );
                            })
                        ) : (
                            [true, false].map((val) => {
                                const isSelected = currentPlayer?.currentAnswer === val;
                                const isCorrect = val === room.questions[room.currentQuestionIndex].correctAnswer;
                                
                                let buttonClass = "bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 shadow-sm";
                                if (room.isShowingResults) {
                                    if (isCorrect) buttonClass = "bg-green-600 text-white shadow-md ring-2 ring-green-600 ring-offset-2 dark:ring-offset-zinc-950";
                                    else if (isSelected) buttonClass = "bg-red-500 text-white opacity-80";
                                    else buttonClass = "bg-zinc-100 dark:bg-zinc-800 opacity-50";
                                } else if (isSelected) {
                                    buttonClass = "bg-blue-600 text-white shadow-md ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-zinc-950";
                                } else if (areOptionsDisabled) {
                                     buttonClass = "bg-zinc-200 dark:bg-zinc-800 opacity-50 cursor-not-allowed";
                                }
                                
                                return (
                                    <button
                                        key={val.toString()}
                                        onClick={() => handleAnswer(val)}
                                        disabled={areOptionsDisabled}
                                        className={cn(
                                            "p-6 rounded-xl text-lg font-medium transition-all transform",
                                            !areOptionsDisabled && "hover:scale-[1.02] active:scale-[0.98]",
                                            buttonClass
                                        )}
                                    >
                                        {val ? "Verdadeiro" : "Falso"}
                                    </button>
                                )
                            })
                        )}
                     </div>

                     {/* Status Footer */}
                     <div className="mt-8 space-y-4">
                        {currentPlayer?.currentAnswer !== undefined && currentPlayer?.currentAnswer !== null && !room.isShowingResults && (
                            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg animate-in fade-in slide-in-from-bottom-4">
                                Resposta enviada! Aguardando os outros jogadores...
                            </div>
                        )}
                        
                        {isTimeUp && !room.isShowingResults && (
                            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg animate-in fade-in slide-in-from-bottom-4">
                                Tempo esgotado!
                            </div>
                        )}

                        {showNextButton && (
                             <button
                                onClick={handleNextQuestion}
                                className={cn(
                                    "w-full sm:w-auto px-8 py-3 text-white rounded-full font-bold transition-colors flex items-center justify-center gap-2 mx-auto shadow-lg animate-bounce",
                                    room.isShowingResults ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
                                )}
                              >
                                {room.isShowingResults ? "Próxima Pergunta" : "Ver Resultados"} <Play className="w-4 h-4" />
                              </button>
                        )}
                     </div>
                </div>
            ) : (
                <div className="text-center text-zinc-500">Carregando pergunta...</div>
            )}
        </div>
      )}

      {/* Finished View (Basic Implementation) */}
      {room.status === 'finished' && (
          <div className="text-center">
              <h2 className="text-3xl font-bold">Fim de Jogo!</h2>
              {/* Leaderboard implementation would go here */}
          </div>
      )}
    </main>
  );
}
                    