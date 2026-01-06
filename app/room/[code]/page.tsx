"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRoom } from "@/hooks/useRoom";
import { cn } from "@/lib/utils";
import { Loader2, Play, Clock, Trophy, Medal, Crown, Home } from "lucide-react";

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
  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);

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

      {/* Finished View */}
      {room.status === 'finished' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="text-center space-y-2">
                  <h2 className="text-4xl font-bold text-zinc-900 dark:text-white">Fim de Jogo!</h2>
                  <p className="text-zinc-500">Confira o ranking final</p>
              </div>

              {/* Podium */}
              <div className="flex justify-center items-end gap-4 sm:gap-8 h-64 mb-12">
                  {/* 2nd Place */}
                  {room.players.length >= 2 && (
                      <div className="flex flex-col items-center gap-2 w-24 sm:w-32 animate-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-backwards">
                          <div className="relative">
                              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-2xl font-bold border-4 border-slate-300 shadow-lg">
                                  {sortedPlayers[1].name[0].toUpperCase()}
                              </div>
                              <div className="absolute -bottom-2 -right-2 bg-slate-300 text-slate-700 p-1 rounded-full shadow-sm">
                                  <Medal className="w-4 h-4" />
                              </div>
                          </div>
                          <div className="text-center">
                              <p className="font-bold truncate w-full text-slate-600 dark:text-slate-400">{sortedPlayers[1].name}</p>
                              <p className="text-sm font-mono text-slate-500">{sortedPlayers[1].score} pts</p>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-800 h-24 rounded-t-lg mt-2 flex items-end justify-center pb-2 shadow-inner">
                              <span className="text-4xl font-black text-slate-300 dark:text-slate-700">2</span>
                          </div>
                      </div>
                  )}

                  {/* 1st Place */}
                  {room.players.length >= 1 && (
                      <div className="flex flex-col items-center gap-2 w-28 sm:w-36 z-10 animate-in slide-in-from-bottom-16 duration-1000 delay-500 fill-mode-backwards">
                           <div className="relative">
                              <Crown className="w-8 h-8 text-yellow-500 absolute -top-10 left-1/2 -translate-x-1/2 animate-bounce" />
                              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-3xl font-bold border-4 border-yellow-400 shadow-xl">
                                  {sortedPlayers[0].name[0].toUpperCase()}
                              </div>
                              <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 p-1 rounded-full shadow-sm">
                                  <Trophy className="w-5 h-5" />
                              </div>
                          </div>
                          <div className="text-center">
                              <p className="font-bold text-lg truncate w-full text-yellow-600 dark:text-yellow-400">{sortedPlayers[0].name}</p>
                              <p className="text-sm font-mono text-yellow-600 dark:text-yellow-500 font-bold">{sortedPlayers[0].score} pts</p>
                          </div>
                          <div className="w-full bg-yellow-100 dark:bg-yellow-900/20 h-32 rounded-t-lg mt-2 flex items-end justify-center pb-2 shadow-inner border-t-4 border-yellow-400">
                              <span className="text-5xl font-black text-yellow-400/50">1</span>
                          </div>
                      </div>
                  )}

                  {/* 3rd Place */}
                  {room.players.length >= 3 && (
                      <div className="flex flex-col items-center gap-2 w-24 sm:w-32 animate-in slide-in-from-bottom-12 duration-1000 delay-100 fill-mode-backwards">
                          <div className="relative">
                              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-2xl font-bold border-4 border-orange-300 shadow-lg">
                                  {sortedPlayers[2].name[0].toUpperCase()}
                              </div>
                              <div className="absolute -bottom-2 -right-2 bg-orange-300 text-orange-800 p-1 rounded-full shadow-sm">
                                  <Medal className="w-4 h-4" />
                              </div>
                          </div>
                          <div className="text-center">
                              <p className="font-bold truncate w-full text-orange-600 dark:text-orange-400">{sortedPlayers[2].name}</p>
                              <p className="text-sm font-mono text-orange-500">{sortedPlayers[2].score} pts</p>
                          </div>
                          <div className="w-full bg-orange-50 dark:bg-orange-900/10 h-16 rounded-t-lg mt-2 flex items-end justify-center pb-2 shadow-inner">
                              <span className="text-4xl font-black text-orange-200 dark:text-orange-800">3</span>
                          </div>
                      </div>
                  )}
              </div>

              {/* List for rest */}
              {room.players.length > 3 && (
                  <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                      {sortedPlayers.slice(3).map((player, idx) => (
                          <div key={player.id} className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                              <div className="flex items-center gap-4">
                                  <span className="text-zinc-400 font-mono w-6 text-center">{idx + 4}</span>
                                  <div className="flex items-center gap-3">
                                      <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-600 dark:text-zinc-400">
                                          {player.name[0].toUpperCase()}
                                      </div>
                                      <span className="font-medium">{player.name}</span>
                                  </div>
                              </div>
                              <span className="font-mono font-bold text-zinc-600 dark:text-zinc-400">{player.score} pts</span>
                          </div>
                      ))}
                  </div>
              )}

              <div className="flex justify-center pt-8">
                  <button
                      onClick={() => {
                          localStorage.removeItem("jw-game-room-code");
                          router.push("/");
                      }}
                      className="px-8 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
                  >
                      <Home className="w-4 h-4" /> Voltar ao Início
                  </button>
              </div>
          </div>
      )}
    </main>
  );
}
                    