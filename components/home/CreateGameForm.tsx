"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Users, CheckCircle, Clock, Search, ArrowRight, ArrowLeft, Trophy, Settings2 } from "lucide-react";
import { GameMode } from "@/types";
import { Deck, getDecks } from "@/lib/decks";
import { getCategories, Category } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UserAvatar } from "../ui/UserAvatar";

interface CreateGameFormProps {
  userId?: string;
}

// Variantes de animação para transição suave lateral
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
    position: "absolute" as const, // Importante para evitar pulos no layout
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    position: "relative" as const,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 50 : -50,
    opacity: 0,
    position: "absolute" as const,
  }),
};

export function CreateGameForm({ userId }: CreateGameFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Controle dos Passos
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0); // Para saber se a animação vai pra esq ou dir

  // Form State
  const [hostName, setHostName] = useState("");
  const [gameMode, setGameMode] = useState<GameMode>('time');
  const [timeLimit, setTimeLimit] = useState(30);
  const [dynamicScoring, setDynamicScoring] = useState(false);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Carregamento de Dados
  useEffect(() => {
    async function loadDecks() {
      const loadedDecks = await getDecks(userId);
      setDecks(loadedDecks);
      // Não seleciona automaticamente o primeiro para forçar o usuário a escolher
    }
    loadDecks();
  }, [userId]);

  useEffect(() => {
    async function loadCats() {
      const cats = await getCategories();
      setCategories(cats);
    }
    loadCats();
  }, []);

  // Filtros
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

  const categoryFilteredDecks = useMemo(() => {
    if (!selectedCategory) return filteredDecks;
    return filteredDecks.filter(d => (d.categories || []).includes(selectedCategory));
  }, [filteredDecks, selectedCategory]);

  // Navegação
  const nextStep = () => {
    if (step === 0 && !hostName.trim()) {
        toast.error("Por favor, digite seu nome.");
        return;
    }
    if (step === 1 && !selectedDeckId) {
        toast.error("Por favor, escolha um tema.");
        return;
    }
    setDirection(1);
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((prev) => prev - 1);
  };

  // Envio
  const handleCreate = async () => {
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
            showResultsAfterQuestion: true,
            dynamicScoring
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
      toast.success(`Sala ${data.roomCode} criada!`);
      router.push(`/room/${data.roomCode}`);
    } catch (error) {
      console.error(error);
      toast.error("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  // Renderização dos Passos
  return (
    <div className="w-full flex flex-col h-full min-h-[400px]">
      
      {/* Indicador de Progresso Simples */}
      <div className="flex justify-between mb-6 px-1">
        {[0, 1, 2].map((s) => (
            <div key={s} className="flex flex-col items-center gap-1 w-1/3">
                <div className={cn(
                    "h-1.5 w-full rounded-full transition-colors duration-300",
                    step >= s ? "bg-indigo-600" : "bg-zinc-200 dark:bg-zinc-700"
                )} />
                <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    step >= s ? "text-indigo-600" : "text-zinc-400"
                )}>
                    {s === 0 && "Nome"}
                    {s === 1 && "Tema"}
                    {s === 2 && "Config"}
                </span>
            </div>
        ))}
      </div>

      {/* Conteúdo do Passo (Relativo para animação funcionar) */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          
          {/* PASSO 1: NOME */}
          {step === 0 && (
            <motion.div
              key="step0"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
              className="w-full space-y-4"
            >
              <div className="text-center space-y-2 mb-8 mt-4">
                <div className="mx-auto w-fit">
                    {hostName ? (
                        <UserAvatar playerName={hostName} className="w-16 h-16 shadow-lg" />
                    ) : (
                        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <Users className="w-8 h-8" />
                        </div>
                    )}
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Quem será o host?</h3>
                <p className="text-sm text-zinc-500">Digite como você quer ser chamado na sala.</p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="hostName" className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">
                  Seu Apelido
                </label>
                <input
                  id="hostName"
                  autoFocus
                  type="text"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                  className="w-full h-14 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-lg text-center font-bold text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="Ex: Matheus"
                />
              </div>
            </motion.div>
          )}

          {/* PASSO 2: ESCOLHER TEMA */}
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
              className="w-full flex flex-col h-full"
            >
                {/* Header fixo do passo */}
               <div className="space-y-3 pb-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Escolha o Tema</h3>
                        <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-500">
                            {(selectedCategory ? categoryFilteredDecks.length : filteredDecks.length)} opções
                        </span>
                    </div>

                    {/* Filtros de Categoria */}
                    {categories.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                        <button
                        onClick={() => setSelectedCategory(null)}
                        className={cn(
                            "whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                            !selectedCategory
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                            : "border-zinc-200 bg-white dark:bg-zinc-800 dark:border-zinc-700 text-zinc-600"
                        )}
                        >
                        Todas
                        </button>
                        {categories.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => setSelectedCategory(c.name)}
                            className={cn(
                            "whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                            selectedCategory === c.name
                                ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                                : "border-zinc-200 bg-white dark:bg-zinc-800 dark:border-zinc-700 text-zinc-600"
                            )}
                        >
                            {c.name}
                        </button>
                        ))}
                    </div>
                    )}

                    {/* Busca */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input 
                        type="text"
                        placeholder="Buscar tema..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-10 pl-9 pr-4 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                        />
                    </div>
               </div>

                {/* Lista com Scroll Dedicado */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-2 mt-2 max-h-[300px] sm:max-h-[400px]">
                  {(selectedCategory ? categoryFilteredDecks : filteredDecks).map((deck) => (
                    <div
                      key={deck.id}
                      onClick={() => setSelectedDeckId(deck.id)}
                      className={cn(
                        "p-3 rounded-xl border cursor-pointer transition-all text-left relative",
                        selectedDeckId === deck.id
                          ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 ring-1 ring-indigo-500"
                          : "border-zinc-200 bg-white dark:bg-zinc-800/50 dark:border-zinc-700 hover:border-zinc-300"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                          {deck.title}
                        </span>
                        {selectedDeckId === deck.id && (
                          <CheckCircle className="w-4 h-4 text-indigo-500" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-1">{deck.description}</p>
                      
                      {/* Tags do Card */}
                      <div className="mt-2 flex items-center gap-2">
                         {deck.isGlobal ? (
                            <span className="text-[9px] font-bold uppercase bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded">Global</span>
                         ) : (
                            <span className="text-[9px] font-bold uppercase bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded">Pessoal</span>
                         )}
                         {deck.categories?.slice(0, 2).map(cat => (
                             <span key={cat} className="text-[9px] text-zinc-400">#{cat}</span>
                         ))}
                      </div>
                    </div>
                  ))}
                  {(selectedCategory ? categoryFilteredDecks : filteredDecks).length === 0 && (
                      <div className="py-8 text-center text-zinc-500 text-sm">Nada encontrado.</div>
                  )}
                </div>
            </motion.div>
          )}

          {/* PASSO 3: CONFIGURAÇÕES */}
          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
              className="w-full space-y-6"
            >
               <div className="text-center space-y-2 mt-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
                    <Settings2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Como será o jogo?</h3>
                <p className="text-sm text-zinc-500">Defina as regras da partida.</p>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">
                  Modo de Jogo
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGameMode("time")}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl border text-sm transition-all h-24 justify-center",
                      gameMode === "time"
                        ? "border-indigo-500 bg-indigo-50/50 text-indigo-700 dark:bg-indigo-900/20 ring-1 ring-indigo-500"
                        : "border-zinc-200 bg-white dark:bg-zinc-800 hover:bg-zinc-50"
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
                        ? "border-indigo-500 bg-indigo-50/50 text-indigo-700 dark:bg-indigo-900/20 ring-1 ring-indigo-500"
                        : "border-zinc-200 bg-white dark:bg-zinc-800 hover:bg-zinc-50"
                    )}
                  >
                    <Trophy className="w-6 h-6" />
                    <span className="font-medium">Modo Zen</span>
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {gameMode === "time" && (
                    <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1.5 overflow-hidden"
                    >
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">
                        Segundos por Pergunta: <span className="text-indigo-600">{timeLimit}s</span>
                    </label>
                    <input
                        type="range"
                        min="5"
                        max="120"
                        step="5"
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(Number(e.target.value))}
                        className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-xs text-zinc-400 px-1">
                        <span>5s</span>
                        <span>120s</span>
                    </div>
                    </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-zinc-900 dark:text-white">Pontuação Dinâmica</h4>
                  <p className="text-xs text-zinc-500">Mais pontos para quem responder mais rápido.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={dynamicScoring} 
                    onChange={(e) => setDynamicScoring(e.target.checked)} 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER DE NAVEGAÇÃO */}
      <div className="mt-6 flex gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        {step > 0 && (
            <button
                onClick={prevStep}
                disabled={loading}
                className="px-4 py-3 rounded-xl border border-zinc-200 text-zinc-600 font-semibold hover:bg-zinc-50 active:scale-95 transition-all"
            >
                <ArrowLeft className="w-5 h-5" />
            </button>
        )}
        
        {step < 2 ? (
            <button
                onClick={nextStep}
                className={cn(
                    "flex-1 h-12 flex justify-center items-center gap-2 rounded-xl font-semibold transition-all shadow-lg active:scale-[0.98]",
                    (step === 0 && !hostName.trim()) || (step === 1 && !selectedDeckId)
                        ? "bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none"
                        : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20"
                )}
            >
                Próximo <ArrowRight className="w-4 h-4" />
            </button>
        ) : (
            <button
                onClick={handleCreate}
                disabled={loading}
                className="flex-1 h-12 flex justify-center items-center gap-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 active:scale-[0.98] transition-all shadow-lg shadow-green-600/20 disabled:opacity-70"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Criar Sala"}
            </button>
        )}
      </div>
    </div>
  );
}