"use client";

import { useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Check, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useJourney } from "@/hooks/useJourney";
import { Deck } from "@/types/journey";
import { Skeleton } from "@/components/ui/skeleton";

// --- Configurações Visuais da Jornada ---
const X_AMPLITUDE = 60; // Largura da curva (px)
const Y_SPACING = 100; // Altura entre níveis (px)

export function JourneyPath() {
  const { stages, getStageDecks, progress, isStageLocked, isDeckLocked, loading } = useJourney();
  const router = useRouter();

  // Encontrar o próximo deck jogável (primeiro desbloqueado e não concluído) para o tooltip e scroll
  const nextActiveDeckId = useMemo(() => {
    if (loading) return null;
    for (const stage of stages) {
      if (isStageLocked(stage.id)) continue;
      
      const stageDecks = getStageDecks(stage.id);
      for (const deck of stageDecks) {
        const isCompleted = progress?.completedDecks.includes(deck.id);
        const isLocked = isDeckLocked(deck);
        
        if (!isLocked && !isCompleted) {
          return deck.id;
        }
      }
    }
    return null;
  }, [stages, getStageDecks, progress, isStageLocked, isDeckLocked, loading]);

  // Scroll automático para o próximo deck ao carregar
  useEffect(() => {
    if (nextActiveDeckId) {
      // Timeout para garantir que o DOM foi renderizado completamente
      const timer = setTimeout(() => {
        const element = document.getElementById(`deck-node-${nextActiveDeckId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [nextActiveDeckId]);

  // Exibe o Skeleton mantendo o formato da curva
  if (loading) {
    return <JourneySkeleton />;
  }

  // Índice global para manter a continuidade da onda senoidal entre diferentes estágios
  let globalDeckIndex = 0;

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto py-8 px-4 gap-4 pb-32 overflow-hidden">
      {stages.map((stage) => {
        const locked = isStageLocked(stage.id);
        const stageDecks = getStageDecks(stage.id);
        
        // Salva o índice onde este estágio começa para calcular o SVG corretamente
        const startDeckIndex = globalDeckIndex;
        // Atualiza o índice global para o próximo estágio
        globalDeckIndex += stageDecks.length;

        return (
          <div key={stage.id} className="w-full flex flex-col items-center relative z-10">
            {/* Header da Seção (Estilo Duolingo) */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "w-full text-center mb-8 p-5 rounded-2xl border-b-4 transition-all relative z-20",
                locked
                  ? "bg-zinc-200 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400"
                  : `${stage.color} border-black/20 text-white shadow-xl`
              )}
            >
              <h2 className="text-xl font-extrabold tracking-tight uppercase">
                {stage.title}
              </h2>
              <p className={cn("text-xs sm:text-sm font-medium opacity-90", locked ? "text-zinc-400" : "text-white")}>
                {stage.description}
              </p>
            </motion.div>

            {/* Container dos Nós + Linha Curva */}
            <div className="relative w-full" style={{ height: stageDecks.length * Y_SPACING }}>
              
              {/* A Linha do Caminho (SVG) */}
              <CurvedPathSVG 
                count={stageDecks.length} 
                startIndex={startDeckIndex} 
                isLocked={locked} 
              />

              {/* Os Botões (Nós) */}
              {stageDecks.map((deck, index) => {
                const actualIndex = startDeckIndex + index;
                const isCompleted = progress?.completedDecks.includes(deck.id);
                const isLocked = isDeckLocked(deck);
                const isActive = !isLocked && !isCompleted;
                const isNext = deck.id === nextActiveDeckId;
                
                // Cálculo da posição X (Onda Senoidal)
                const xOffset = Math.sin(actualIndex * 2.5) * X_AMPLITUDE;

                return (
                  <div
                    key={deck.id}
                    className="absolute left-0 right-0 flex justify-center z-20"
                    style={{ 
                      top: index * Y_SPACING,
                      transform: `translateX(${xOffset}px)`
                    }}
                  >
                    <DeckNode
                      deck={deck}
                      isCompleted={!!isCompleted}
                      isLocked={!!isLocked}
                      isActive={isActive}
                      showTooltip={isNext}
                      domId={`deck-node-${deck.id}`}
                      color={stage.color}
                      onClick={() => {
                        if (!isLocked) router.push(`/journey/play/${deck.id}`);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ------------------------------------------------------------------
// COMPONENTE: SKELETON LOADING (Com formato da curva)
// ------------------------------------------------------------------
function JourneySkeleton() {
  // Simula 2 estágios com 3 itens cada para preencher a tela
  const fakeStages = [1, 2]; 
  let globalFakeIndex = 0;

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto py-8 px-4 gap-4 overflow-hidden">
      {fakeStages.map((stageId) => (
        <div key={stageId} className="w-full flex flex-col items-center relative">
          {/* Skeleton Header */}
          <Skeleton className="w-full h-24 rounded-2xl mb-8" />

          {/* Skeleton Nós em Curva */}
          <div className="relative w-full h-[300px]">
             {/* Linha de fundo cinza clara */}
             <CurvedPathSVG count={3} startIndex={globalFakeIndex} isLocked={true} />
             
             {[0, 1, 2].map((i) => {
                const actualIndex = globalFakeIndex + i;
                const xOffset = Math.sin(actualIndex * 2.5) * X_AMPLITUDE;
                return (
                  <div 
                    key={i}
                    className="absolute left-0 right-0 flex justify-center"
                    style={{ 
                      top: i * Y_SPACING,
                      transform: `translateX(${xOffset}px)`
                    }}
                  >
                    <Skeleton className="w-20 h-20 rounded-[2rem] shadow-sm" />
                  </div>
                )
             })}
             {/* Atualiza o indice fake para o próximo loop (apenas para lógica visual, não afeta render) */}
             <span className="hidden">{globalFakeIndex += 3}</span>
          </div>
        </div>
      ))}
    </div>
  );
}


// ------------------------------------------------------------------
// COMPONENTE: LINHA CURVA (SVG)
// ------------------------------------------------------------------
function CurvedPathSVG({ count, startIndex, isLocked }: { count: number, startIndex: number, isLocked: boolean }) {
  const pathData = useMemo(() => {
    if (count <= 1) return "";
    
    // Nota: O SVG precisa ter um sistema de coordenadas que bata com o CSS translate.
    // O translate CSS move a div a partir do centro. 
    // O SVG desenha linhas.
    // Solução simples: O SVG terá viewBox centrado.
    
    return generateSinePath(count, startIndex, X_AMPLITUDE, Y_SPACING);
  }, [count, startIndex]);

  return (
    <svg 
      className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-visible"
      // ViewBox fictício centralizado para facilitar o desenho a partir do meio (x=0)
      // Largura 400, Altura variável. X=200 é o centro.
      viewBox={`0 0 400 ${count * Y_SPACING}`} 
      preserveAspectRatio="xMidYMin slice"
    >
      <path
        d={pathData}
        stroke={isLocked ? "#e4e4e7" : "#d1d5db"} // zinc-200 vs zinc-300
        strokeWidth="12"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="dark:stroke-zinc-800 transition-colors duration-500"
      />
    </svg>
  );
}

// Função auxiliar pura para gerar o path
function generateSinePath(count: number, startIndex: number, xAmp: number, ySpacing: number) {
  let d = "";
  const centerX = 200; // Centro do viewBox (400/2)
  const startX = Math.sin(startIndex * 2.5) * xAmp;
  
  // Move para o centro do primeiro nó (+40px para compensar metade da altura do botão de 80px)
  d += `M ${centerX + startX} 40 `; 

  for (let i = 0; i < count - 1; i++) {
    const currIdx = startIndex + i;
    const nextIdx = startIndex + i + 1;

    const currX = Math.sin(currIdx * 2.5) * xAmp;
    const currY = i * ySpacing + 40;

    const nextX = Math.sin(nextIdx * 2.5) * xAmp;
    const nextY = (i + 1) * ySpacing + 40;

    const controlY = (currY + nextY) / 2;

    // Curva de Bézier Cúbica
    d += `C ${centerX + currX} ${controlY}, ${centerX + nextX} ${controlY}, ${centerX + nextX} ${nextY} `;
  }
  return d;
}

// ------------------------------------------------------------------
// COMPONENTE: BOTÃO DO NÍVEL (NODE)
// ------------------------------------------------------------------
interface DeckNodeProps {
  deck: Deck;
  isCompleted: boolean;
  isLocked: boolean;
  isActive: boolean;
  showTooltip: boolean;
  domId?: string;
  color: string;
  onClick: () => void;
}

function DeckNode({ isCompleted, isLocked, isActive, showTooltip, domId, color, onClick }: DeckNodeProps) {
  // Define as cores dinamicamente
  const bgClass = isLocked 
    ? "bg-zinc-200 dark:bg-zinc-800" 
    : isCompleted 
      ? "bg-amber-400" 
      : color; // ex: bg-blue-500
      
  const borderClass = isLocked
    ? "border-zinc-300 dark:border-zinc-700"
    : isCompleted
      ? "border-amber-600 dark:drop-shadow-[0_6px_18px_rgba(255,191,0,0.5)] "
      : `border-black/20`; // Borda escurecida genérica funciona bem para cores vivas

  const textClass = isLocked ? "text-zinc-400" : "text-white";

  return (
    <div id={domId} className="relative flex flex-col items-center group">
      {/* Tooltip "COMEÇAR" Flutuante */}
      {showTooltip && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="absolute -top-14 z-40 pointer-events-none"
        >
          <div className="bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white px-3 py-1.5 rounded-xl font-bold text-sm shadow-xl border-2 border-zinc-100 dark:border-zinc-700 whitespace-nowrap uppercase tracking-wider">
            Começar
          </div>
          {/* Triângulo do Tooltip */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-zinc-800 border-b-2 border-r-2 border-zinc-100 dark:border-zinc-700 rotate-45" />
        </motion.div>
      )}

      {/* Botão 3D */}
      <motion.button
        onClick={onClick}
        disabled={isLocked}
        whileHover={!isLocked ? { scale: 1.05 } : {}}
        whileTap={!isLocked ? { scale: 0.95, translateY: 4 } : {}}
        className={cn(
          "w-20 h-20 rounded-[1.8rem] flex items-center justify-center text-3xl shadow-sm relative z-10 transition-colors",
          (isCompleted || isLocked) && "border-b-[6px] active:border-b-0 active:translate-y-[6px]", // 3D visual only for completed or locked
          bgClass,
          borderClass,
          textClass,
          "focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-zinc-300 dark:focus:ring-zinc-800"
        )}
      >
        {isCompleted ? (
          <Check className="w-8 h-8 stroke-[4]" />
        ) : isLocked ? (
          <Lock className="w-7 h-7 opacity-40" />
        ) : (
          <Star className="w-8 h-8 fill-current animate-pulse" />
        )}
        
        {/* Efeito de brilho interno para itens ativos */}
        {isActive && (
           <div className="absolute inset-0 rounded-[1.8rem] ring-4 ring-white/30" />
        )}
      </motion.button>
    </div>
  );
}