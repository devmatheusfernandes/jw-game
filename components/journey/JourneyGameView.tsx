"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Flag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useJourney } from "@/hooks/useJourney";
import { useSound } from "@/hooks/useSound";
import { useHaptic } from "@/hooks/useHaptic";
import { usePreferences } from "@/contexts/PreferencesContext";
import { triggerConfetti, triggerBadgeConfetti } from "@/lib/confetti";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Question } from "@/types";
import { Badge } from "@/types/journey";
import { ComboIndicator } from "./ComboIndicator";
import { HintComponent } from "./HintComponent";

// Frases de Motivação (Acertos/Combo)
const SUCCESS_MESSAGES = [
  "Incrível!", "Continue assim!", "Você está indo muito bem!", "Imparável!",
  "Excelente progresso!", "Brilhante!", "Sua dedicação é exemplar!",
  "Nada te segura!", "Fantástico!", "Maravilhoso!"
];

// Frases de Incentivo (Erros/Perda de Combo)
const ENCOURAGEMENT_MESSAGES = [
  "Não desista!", "Aprender faz parte do processo.", "Tente novamente na próxima!",
  "Continue se esforçando!", "O importante é não parar.", "Revise e tente de novo.",
  "Cada erro é um aprendizado.", "Mantenha o foco!", "Não desanime!",
  "Você consegue!", "Respire fundo e continue.", "A persistência traz resultados.",
  "Estamos torcendo por você!", "Quase lá!"
];

interface JourneyGameViewProps {
  deckId: string;
  title: string;
  questions: Question[];
  isLoading?: boolean; // Adicionado prop para controlar o esqueleto
}

export function JourneyGameView({
  deckId,
  title,
  questions,
  isLoading = false,
}: JourneyGameViewProps) {
  const router = useRouter();
  const { play } = useSound();
  const { hintsEnabled } = usePreferences();
  const { saveProgress, finishDeck, progress, submitUserAnswer } = useJourney();
  const footerRef = useRef<HTMLDivElement>(null);

  // Initialize state
  const savedIndex = progress?.deckProgress?.[deckId] || 0;
  const isReplay = progress?.completedDecks?.includes(deckId) || false;

  const [currentIndex, setCurrentIndex] = useState(savedIndex);
  const [selectedAnswer, setSelectedAnswer] = useState<string | boolean | null>(
    null
  );
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [finalIsReplay, setFinalIsReplay] = useState(false);
  const [unlockedHints, setUnlockedHints] = useState<Record<string, boolean>>({});
  const [hintsCost, setHintsCost] = useState(0);

  // Safety check for empty questions or loading
  const currentQuestion = questions?.[currentIndex];

  // Progress calculation
  const totalQuestions = questions?.length || 1;
  const progressPercent = (currentIndex / totalQuestions) * 100;

  // Save progress
  useEffect(() => {
    if (currentIndex > 0 && !completed) {
      saveProgress(deckId, currentIndex);
    }
  }, [currentIndex, deckId, saveProgress, completed]);

  // Scroll to bottom when feedback appears (mobile UX)
  useEffect(() => {
    if (isAnswered) {
      setTimeout(() => {
        footerRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [isAnswered]);

  const handleAnswer = (answer: string | boolean) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    // Normalização para comparação robusta
    const valA = String(answer).toLowerCase().trim();
    const valB = String(currentQuestion.correctAnswer).toLowerCase().trim();
    
    // Mapeamento de pt-BR para en-US se necessário
    const mapToBool = (val: string) => {
      if (val === "verdadeiro" || val === "true") return "true";
      if (val === "falso" || val === "false") return "false";
      return val;
    };

    const correct = mapToBool(valA) === mapToBool(valB);
    setIsCorrect(correct);

    if (correct) {
      setCorrectCount((prev) => prev + 1);
      
      const newCombo = comboCount + 1;
      const bonus = Math.min((newCombo - 1) * 2, 20); // Bônus começa a partir do 2º acerto
      const points = 10 + Math.max(0, bonus);

      setSessionScore((prev) => prev + points);
      setComboCount(newCombo);

      // Se tiver combo (2+), mostra frase de sucesso
      if (newCombo >= 2) {
         const msg = SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)];
         setFeedbackMessage(`${msg} (+${points} XP)`);
      } else {
         setFeedbackMessage(`Correto! (+${points} XP)`);
      }
      play("correct");

      if (submitUserAnswer) {
        submitUserAnswer(deckId, correct, Math.max(0, bonus)).then((result) => {
          if (result?.newBadges && result.newBadges.length > 0) {
            setEarnedBadges((prev) => {
              const existingIds = new Set(prev.map((b) => b.id));
              const uniqueNew = result.newBadges.filter(
                (b) => !existingIds.has(b.id)
              );
              return [...prev, ...uniqueNew];
            });
          }
        });
      }
    } else {
      // Mostra frase de incentivo apenas se perdeu um combo
      if (comboCount >= 2) {
         const msg = ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)];
         setFeedbackMessage(msg);
      } else {
         setFeedbackMessage("Incorreto...");
      }

      setComboCount(0);
      play("wrong");

      if (submitUserAnswer) {
          submitUserAnswer(deckId, correct, 0);
      }
    }
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      resetState();
    } else {
      handleFinish();
    }
  };

  const resetState = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setIsCorrect(false);
  };

  const handleUnlockHint = () => {
    if (!currentQuestion) return;
    
    const cost = currentQuestion.referencePrice || 20;
    // Verifica se tem saldo suficiente (sessionScore + pontos base do usuário se tivesse acesso ao backend)
    // Como aqui estamos num fluxo isolado, vamos permitir deduzir do sessionScore mesmo que fique negativo temporariamente 
    // ou apenas se tiver sessionScore suficiente. Para melhor UX, vamos permitir ficar negativo na sessão.
    
    setHintsCost(prev => prev + cost);
    setSessionScore(prev => prev - cost); // Deduz imediatamente visualmente
    setUnlockedHints(prev => ({...prev, [currentQuestion.id]: true}));
    play("pop"); // Som de sucesso leve
  };

  const handleFinish = async () => {
    // Snapshot: Salva se era replay ANTES de marcar como completo no banco
    setFinalIsReplay(isReplay);
    setCompleted(true);
    play("victory");
    triggerConfetti();
    const result = await finishDeck(deckId);
    if (result?.newBadges) {
      setEarnedBadges(result.newBadges);
      triggerBadgeConfetti();
    }
  };

  // ------------------------------------------------------------------
  // LOADING STATE (SKELETON)
  // ------------------------------------------------------------------
  if (isLoading || !currentQuestion) {
    return <GameSkeleton />;
  }

  // ------------------------------------------------------------------
  // COMPLETION VIEW
  // ------------------------------------------------------------------
  if (completed) {
    return (
      <CompletionView
        title={title}
        earnedBadges={earnedBadges}
        onBack={() => router.push("/journey")}
        correctCount={correctCount}
        totalQuestions={totalQuestions}
        isReplay={finalIsReplay}
        sessionScore={sessionScore}
        hintsCost={hintsCost}
      />
    );
  }

  // ------------------------------------------------------------------
  // MAIN GAME VIEW
  // ------------------------------------------------------------------
  return (
    <div className="flex flex-col min-h-[100dvh] bg-white dark:bg-zinc-950 max-w-2xl mx-auto shadow-2xl overflow-hidden relative">
      {/* HEADER: Close & Progress */}
      <header className="flex items-center gap-4 p-4 pt-6">
        <button
          onClick={() => router.back()}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex-1 flex items-center gap-3">
          <div className="flex-1 h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden relative">
            <motion.div
              className="h-full bg-green-500 rounded-full absolute top-0 left-0"
              initial={{
                width: `${((currentIndex - 1) / totalQuestions) * 100}%`,
              }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ type: "spring", stiffness: 50, damping: 20 }}
            />
            {/* Highlight/Glow bar */}
            <div className="h-1 bg-white/20 absolute top-1 left-2 right-2 rounded-full" />
          </div>
          
          <ComboIndicator count={comboCount} mode="inline" />
        </div>
      </header>

      {/* SCROLLABLE CONTENT */}
      <main className="flex-1 overflow-y-auto px-4 pb-32">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-8 py-4"
        >
          {/* Question Text */}
          <div className="mt-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-700 dark:text-zinc-100 leading-tight text-center sm:text-left">
              {currentQuestion.text}
            </h2>
          </div>

          {/* Hint Component */}
          {hintsEnabled && currentQuestion.reference && (
            <HintComponent
                reference={currentQuestion.reference}
                price={currentQuestion.referencePrice || 20}
                source={currentQuestion.source}
                isUnlocked={!!unlockedHints[currentQuestion.id]}
                onUnlock={handleUnlockHint}
                canAfford={true} // Pode implementar checagem de saldo global aqui se desejar
            />
          )}

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-3">
            {(currentQuestion.type === "multiple_choice"
              ? currentQuestion.options
              : ["true", "false"]
            )?.map((option, idx) => {
              const isSelected = selectedAnswer === option;
              const isCorrectOption = option === currentQuestion.correctAnswer;

              // Styles Logic
              let bgStyle =
                "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300";
              let borderStyle =
                "border-b-[4px] active:border-b-0 active:translate-y-[4px]"; // Default 3D effect

              if (isAnswered) {
                borderStyle = "border-b-[4px]"; // Remove click effect when answered
                if (isSelected && isCorrect) {
                  bgStyle = "bg-green-100 border-green-500 text-green-700";
                } else if (isSelected && !isCorrect) {
                  bgStyle = "bg-red-100 border-red-500 text-red-700";
                } else if (isCorrectOption && !isCorrect) {
                  // Show correct answer lightly
                  bgStyle =
                    "bg-white border-green-500 text-green-600 border-2 border-b-[4px]";
                } else {
                  bgStyle = "opacity-50 grayscale";
                }
              } else if (isSelected) {
                // Selected state before confirming (if you had a check button separate)
                // But here we confirm on click, so this is transient
                bgStyle = "bg-blue-50 border-blue-400 text-blue-600";
              }

              return (
                <motion.button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  disabled={isAnswered}
                  whileHover={
                    !isAnswered ? { backgroundColor: "rgba(0,0,0,0.02)" } : {}
                  }
                  className={cn(
                    "w-full p-4 sm:p-5 rounded-xl border-2 text-left font-bold text-lg sm:text-xl transition-all flex justify-between items-center relative",
                    bgStyle,
                    borderStyle
                  )}
                >
                  <span>
                    {String(option) === "true"
                      ? "Verdadeiro"
                      : String(option) === "false"
                      ? "Falso"
                      : option}
                  </span>

                  {/* Icons for feedback (Optional, visual clutter sometimes) */}
                  {isAnswered && isSelected && isCorrect && (
                    <Check className="text-green-600 w-6 h-6" />
                  )}
                  {isAnswered && isSelected && !isCorrect && (
                    <X className="text-red-500 w-6 h-6" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </main>

      {/* FEEDBACK FOOTER SHEET - Responsivo: Bottom Sheet (Mobile) vs Floating Card (Desktop) */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            ref={footerRef}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              // --- BASE & MOBILE STYLES (Bottom Sheet) ---
              "fixed bottom-0 left-0 right-0 z-50",
              "p-4 pb-8 flex flex-col gap-4 border-t-4", // Layout vertical no mobile

              // --- DESKTOP STYLES (Floating Card) ---
              // Transforma em um card flutuante centralizado
              "sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2", // Centraliza
              "sm:w-[95%] sm:max-w-3xl", // Largura controlada
              "sm:rounded-3xl sm:border-2", // Borda grossa e arredondada
              "sm:shadow-2xl", // Sombra profunda para dar destaque
              "sm:flex-row sm:items-center sm:justify-between sm:p-4 sm:pb-4", // Layout horizontal no desktop

              // --- CORES DINÂMICAS ---
              isCorrect
                ? "bg-green-100 dark:bg-zinc-900 border-green-500 text-green-800"
                : "bg-red-100 dark:bg-zinc-900 border-red-500 text-red-800"
            )}
          >
            {/* Conteúdo: Ícone + Texto */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div
                className={cn(
                  "w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shrink-0 shadow-sm border-2",
                  isCorrect
                    ? "bg-white border-green-200 text-green-500"
                    : "bg-white border-red-200 text-red-500"
                )}
              >
                {isCorrect ? (
                  <Check className="w-6 h-6 sm:w-8 sm:h-8 stroke-[4]" />
                ) : (
                  <X className="w-6 h-6 sm:w-8 sm:h-8 stroke-[4]" />
                )}
              </div>
             

              <div className="flex-1">
                 
                <h3
                  className={cn(
                    "font-extrabold text-xl sm:text-2xl",
                    isCorrect
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                >
                  {isCorrect ? "Correto!" : "Incorreto..."}
                </h3>
                <p>{feedbackMessage}</p>
                {!isCorrect && (
                  <p className="text-red-600/80 dark:text-red-300 font-medium text-sm sm:text-base leading-tight mt-1">
                    Resposta:{" "}
                    <span className="font-bold">
                      {String(currentQuestion.correctAnswer)}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Botão de Ação */}
            <Button
              onClick={handleNext}
              className={cn(
                "w-full sm:w-auto sm:min-w-[160px] h-12 sm:h-14 text-lg font-bold uppercase tracking-wider border-b-4 active:border-b-0 active:translate-y-1 transition-all shadow-sm rounded-xl",
                isCorrect
                  ? "bg-green-500 hover:bg-green-600 border-green-700 text-white"
                  : "bg-red-500 hover:bg-red-600 border-red-700 text-white"
              )}
            >
              {currentIndex === questions.length - 1 ? "Concluir" : "Continuar"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SKIP BUTTON (Only visible if not answered) */}
      {!isAnswered && (
        <div className="fixed bottom-0 left-0 right-0 p-4 border-t bg-white dark:bg-zinc-950 max-w-2xl mx-auto flex justify-between items-center">
          <Button
            variant="ghost"
            className="text-zinc-400 hover:text-zinc-600 font-bold uppercase tracking-wider"
            onClick={handleNext}
          >
            Pular
          </Button>
          <Button
            disabled
            className="hidden bg-zinc-200 text-zinc-400 font-bold uppercase tracking-wider px-8"
          >
            Verificar
          </Button>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// SUB-COMPONENT: COMPLETION VIEW
// ------------------------------------------------------------------
interface CompletionViewProps {
  title: string;
  earnedBadges: Badge[];
  onBack: () => void;
  correctCount: number;
  totalQuestions: number;
  isReplay: boolean;
  sessionScore: number;
  hintsCost: number;
}

function CompletionView({
  title,
  earnedBadges,
  onBack,
  correctCount,
  totalQuestions,
  isReplay,
  sessionScore,
  hintsCost,
}: CompletionViewProps) {
  const xpGained = isReplay ? 0 : sessionScore + 50; // Pontuação acumulada + 50 bônus de conclusão
  const accuracy = Math.round((correctCount / totalQuestions) * 100);

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-white dark:bg-zinc-950 p-6 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center shadow-xl mb-8 border-b-8 border-yellow-500"
      >
        <Check className="w-16 h-16 text-white stroke-[4]" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-4xl font-extrabold text-zinc-800 dark:text-zinc-100 mb-2"
      >
        Lição Concluída!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-zinc-500 text-lg mb-8"
      >
        Você completou o deck <br />
        <span className="text-yellow-600 font-bold">"{title}"</span>
      </motion.p>

      {earnedBadges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-yellow-50 dark:bg-yellow-900/10 p-6 rounded-2xl border-2 border-yellow-200 dark:border-yellow-800/50 mb-8 w-full max-w-sm"
        >
          <h3 className="font-bold text-yellow-700 dark:text-yellow-400 mb-4 uppercase text-sm tracking-wider flex items-center justify-center gap-2">
            <Flag className="w-4 h-4" /> Novas Conquistas
          </h3>
          <div className="flex gap-4 justify-center">
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center animate-bounce-slow"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-200 to-orange-400 rounded-full flex items-center justify-center mb-2 shadow-lg border-2 border-white">
                  <span className="text-3xl">🏆</span>
                </div>
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  {badge.title}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Gamification Stats (Real Data) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex gap-4 mb-8 w-full max-w-sm"
      >
        <div className="flex-1 bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-900 rounded-xl p-3 flex flex-col items-center">
          <span className="text-xs font-bold text-blue-400 uppercase">
            XP Ganho
          </span>
          <span className="text-xl font-black text-blue-600">+{xpGained}</span>
          {isReplay && (
            <span className="text-[10px] text-blue-400/70 font-bold uppercase">
              (Já completado)
            </span>
          )}
        </div>
        
        {hintsCost > 0 && (
          <div className="flex-1 bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-100 dark:border-amber-900 rounded-xl p-3 flex flex-col items-center">
            <span className="text-xs font-bold text-amber-400 uppercase">
              Dicas
            </span>
            <span className="text-xl font-black text-amber-600">-{hintsCost}</span>
          </div>
        )}

        <div className="flex-1 bg-green-50 dark:bg-green-900/10 border-2 border-green-100 dark:border-green-900 rounded-xl p-3 flex flex-col items-center">
          <span className="text-xs font-bold text-green-400 uppercase">
            Acertos
          </span>
          <span className="text-xl font-black text-green-600">{accuracy}%</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-sm"
      >
        <Button
          onClick={onBack}
          className="w-full h-14 text-lg font-bold bg-zinc-800 text-zinc-100 hover:bg-zinc-900 border-b-4 border-zinc-950 active:border-b-0 active:translate-y-1 transition-all"
        >
          CONTINUAR
        </Button>
      </motion.div>
    </div>
  );
}

// ------------------------------------------------------------------
// SUB-COMPONENT: SKELETON
// ------------------------------------------------------------------
function GameSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-4 flex flex-col h-[100dvh]">
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="flex-1 h-4 rounded-full" />
      </div>

      <div className="flex-1 flex flex-col justify-center gap-6">
        <Skeleton className="h-20 w-3/4 rounded-2xl" />
        <div className="grid gap-4 mt-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>

      <div className="h-20 flex items-center">
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
