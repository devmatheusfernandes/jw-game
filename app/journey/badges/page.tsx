"use client";

import { useMemo } from "react";
import { useJourney } from "@/hooks/useJourney";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Handshake, Footprints, Flame, Zap, Calendar, 
  Target, Brain, Crown, Star, BookOpen, Scroll, Lock, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

// Mapeamento de ícones
const IconMap: Record<string, React.ElementType> = {
  Handshake, Footprints, Flame, Zap, Calendar, Target, Brain, Crown, Star, BookOpen, Scroll
};

// Variáveis de animação mais "elásticas" para sensação de app nativo
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.8 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
  }
};

export default function BadgesPage() {
  const { badges, progress, loading } = useJourney();
  const router = useRouter();

  const earnedIds = useMemo(() => new Set(progress?.earnedBadges || []), [progress]);
  const completionPercentage = badges.length > 0 ? (earnedIds.size / badges.length) * 100 : 0;

  if (loading) return <BadgesSkeleton />;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20 selection:bg-yellow-200 dark:selection:bg-yellow-900">
      
      {/* Header Fixo com Efeito Glass */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()} 
              className="h-9 w-9 -ml-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full shrink-0 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </Button>
            
            <div className="flex-1">
              <h1 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 leading-none">
                Coleção de Conquistas
              </h1>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Continue sua jornada para desbloquear
              </span>
            </div>
          </div>

          {/* Barra de Progresso Animada */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full relative"
              >
                {/* Brilho na barra */}
                <div className="absolute top-0 right-0 bottom-0 w-full bg-gradient-to-l from-white/30 to-transparent" />
              </motion.div>
            </div>
            <div className="text-xs font-bold text-zinc-600 dark:text-zinc-300 min-w-[3rem] text-right">
              {Math.round(completionPercentage)}%
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6"
        >
          {badges.map((badge) => {
            const isEarned = earnedIds.has(badge.id);
            const Icon = IconMap[badge.icon] || Star;

            return (
              <motion.div
                key={badge.id}
                variants={itemVariants}
                whileTap={{ scale: 0.96 }}
                whileHover={isEarned ? { y: -5 } : {}}
                className={cn(
                  "group relative flex flex-col items-center p-4 rounded-2xl h-full transition-all duration-300",
                  // ESTILO CONDICIONAL:
                  isEarned 
                    ? "bg-white dark:bg-zinc-900 border border-yellow-200 dark:border-yellow-900/30 shadow-[0_4px_20px_-4px_rgba(250,204,21,0.15)] dark:shadow-none" 
                    : "bg-zinc-100/50 dark:bg-zinc-900/30 border-2 border-dashed border-zinc-200 dark:border-zinc-800 opacity-80"
                )}
              >
                {/* Badge Status Icon (Check or Lock) */}
                <div className="absolute top-3 right-3">
                  {isEarned ? (
                    <motion.div 
                      initial={{ scale: 0 }} animate={{ scale: 1 }} 
                      className="text-yellow-500 dark:text-yellow-400"
                    >
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-sm" fill="currentColor" stroke="white" />
                    </motion.div>
                  ) : (
                    <Lock className="w-4 h-4 text-zinc-300 dark:text-zinc-700" />
                  )}
                </div>

                {/* ÍCONE CENTRAL */}
                <div className={cn(
                  "relative w-14 h-14 sm:w-16 sm:h-16 mb-3 rounded-full flex items-center justify-center transition-all duration-500",
                  isEarned 
                    ? "bg-gradient-to-br from-yellow-100 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/10 text-yellow-600 dark:text-yellow-400 shadow-sm" 
                    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 grayscale"
                )}>
                    <Icon className={cn(
                      "w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-300",
                      isEarned && "group-hover:scale-110 group-hover:rotate-6"
                    )} />
                    
                    {/* Efeito de anel brilhante se conquistado */}
                    {isEarned && (
                      <div className="absolute inset-0 rounded-full ring-2 ring-yellow-400/20 dark:ring-yellow-500/20 group-hover:ring-4 transition-all" />
                    )}
                </div>

                {/* TEXTOS */}
                <div className="text-center w-full z-10">
                  <h3 className={cn(
                    "font-bold text-xs sm:text-sm leading-tight mb-1",
                    isEarned ? "text-zinc-800 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-600"
                  )}>
                    {badge.title}
                  </h3>
                  
                  {/* Descrição: Visível em Desktop, truncada em Mobile */}
                  <p className={cn(
                    "text-[10px] sm:text-xs leading-relaxed line-clamp-2",
                    isEarned ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-400/50 dark:text-zinc-700"
                  )}>
                    {badge.description}
                  </p>
                </div>

                {/* SHIMMER EFFECT (Brilho passando) apenas nos conquistados */}
                {isEarned && (
                  <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 dark:opacity-5 animate-shimmer" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </main>
    </div>
  );
}

// ------------------------------------------------------------------
// SKELETON REFINADO
// ------------------------------------------------------------------
function BadgesSkeleton() {
    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20">
             <div className="px-4 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md mb-6">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                        <div className="flex-1">
                            <Skeleton className="h-5 w-40 mb-2 rounded-md" />
                            <Skeleton className="h-3 w-24 rounded-md" />
                        </div>
                    </div>
                    <Skeleton className="h-2.5 w-full rounded-full" />
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-4 sm:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-40">
                            <Skeleton className="w-16 h-16 rounded-full mb-3 shrink-0" />
                            <Skeleton className="h-4 w-20 mb-2 rounded-md" />
                            <Skeleton className="h-3 w-full rounded-md" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}