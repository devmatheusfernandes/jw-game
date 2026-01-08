"use client";

import { motion } from "framer-motion";
import { Play, Check } from "lucide-react";
import { Room, Player } from "@/types";
import { cn } from "@/lib/utils";
import { useSound } from "@/hooks/useSound";
import { useEffect } from "react";
import { useHaptic } from "@/hooks/useHaptic";

interface GameViewProps {
  room: Room;
  currentPlayer?: Player;
  timeLeft: number | null;
  isHost: boolean;
  onAnswer: (answer: string | boolean) => void;
  onNextQuestion: () => void;
}

export function GameView({ 
  room, 
  currentPlayer, 
  timeLeft, 
  isHost, 
  onAnswer, 
  onNextQuestion 
}: GameViewProps) {
  const { play } = useSound();
  const { triggerSuccess, triggerError } = useHaptic();
  const allAnswered = room.players.every(p => p.currentAnswer !== undefined && p.currentAnswer !== null);
  const isTimeUp = (room.settings.mode === 'time' || room.settings.mode === 'all_answered') && timeLeft === 0;
  const isLastQuestion = room.currentQuestionIndex === room.questions.length - 1;

  // Tocar som de resultado quando revelado
  useEffect(() => {
    if (room.isShowingResults && currentPlayer?.currentAnswer !== undefined) {
        const isCorrect = currentPlayer.currentAnswer === room.questions[room.currentQuestionIndex].correctAnswer;
        if (isCorrect) {
            play('correct');
            triggerSuccess();
        } else {
            play('wrong');
            triggerError();
        }
    }
  }, [room.isShowingResults, currentPlayer?.currentAnswer, room.questions, room.currentQuestionIndex, play, triggerSuccess, triggerError]);

  // Tocar som de contagem regressiva nos últimos 3 segundos (apenas modo tempo)
  useEffect(() => {
    if (room.settings.mode === 'time' && timeLeft !== null && timeLeft > 0 && timeLeft <= 3 && !room.isShowingResults) {
        play('countdown');
    }
  }, [timeLeft, room.isShowingResults, play, room.settings.mode]);

  const handleAnswer = (val: string | boolean) => {
    play('click');
    onAnswer(val);
  };

  const showNextButton = isHost && (allAnswered || isTimeUp || room.isShowingResults);
  const areOptionsDisabled = (currentPlayer?.currentAnswer !== undefined && currentPlayer?.currentAnswer !== null) || isTimeUp || room.isShowingResults;
  
  // Calcula porcentagem do tempo para a barra de progresso
  const timePercentage = room.settings.timeLimitPerQuestion && timeLeft !== null 
    ? (timeLeft / room.settings.timeLimitPerQuestion) * 100 
    : 100;

  return (
    <motion.div
        key="game"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex flex-col h-full gap-4"
    >
         {/* Progress & Timer */}
        <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className={cn(
                "flex justify-between items-center text-xs font-bold text-zinc-400 uppercase tracking-wider",
                room.settings.mode === 'time' && "mb-2"
            )}>
                 <span>Questão {room.currentQuestionIndex + 1}/{room.questions.length}</span>
                 {timeLeft !== null && room.settings.mode === 'time' && <span className={cn(timeLeft < 10 ? "text-red-500" : "text-zinc-500")}>{timeLeft}s</span>}
            </div>
            {/* Timer Bar */}
            {room.settings.mode === 'time' && (
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
            )}
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
                    onClick={onNextQuestion}
                    className={cn(
                        "px-8 py-3 rounded-xl font-bold text-white shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95",
                        room.isShowingResults ? "bg-green-600 hover:bg-green-700 shadow-green-600/30" : "bg-zinc-800 hover:bg-zinc-900 shadow-zinc-900/30"
                    )}
                >
                    {room.isShowingResults 
                        ? (isLastQuestion ? "Ver Ranking Final" : "Próxima Pergunta") 
                        : "Ver Resultados"} <Play className="w-4 h-4 fill-current" />
                </motion.button>
            )}
            {!isHost && !room.isShowingResults && currentPlayer?.currentAnswer && (
                 <span className="text-sm font-medium text-zinc-500 animate-pulse">Aguardando outros jogadores...</span>
            )}
        </div>
    </motion.div>
  );
}
