"use client";

import { useMemo } from "react";
import { useJourney } from "@/hooks/useJourney";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Handshake, Footprints, Flame, Zap, Calendar, 
  Target, Brain, Crown, Star, BookOpen, Scroll, Lock 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

const IconMap: Record<string, React.ElementType> = {
  Handshake, Footprints, Flame, Zap, Calendar, Target, Brain, Crown, Star, BookOpen, Scroll
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1 }
};

export default function BadgesPage() {
  const { badges, progress, loading } = useJourney();
  const router = useRouter();

  const earnedIds = useMemo(() => new Set(progress?.earnedBadges || []), [progress]);

  if (loading) {
    return <BadgesSkeleton />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 pb-20">
      {/* Header Sticky com Blur para melhor aproveitamento de tela */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800 px-4 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()} 
            className="h-10 w-10 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl shrink-0"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-600 dark:text-zinc-400" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100 uppercase truncate">
              Minhas Conquistas
            </h1>
            <div className="flex items-center gap-2">
                {/* Barra de progresso mini para mobile */}
                <div className="h-1.5 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-yellow-400 rounded-full" 
                        style={{ width: `${(earnedIds.size / badges.length) * 100}%` }} 
                    />
                </div>
                <p className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-wider">
                {earnedIds.size}/{badges.length}
                </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          // GRID RESPONSIVO:
          // Mobile (<640px): 2 colunas com gap apertado (gap-3)
          // Tablet (sm): 3 colunas
          // Desktop (md): 4 colunas
          // Large (lg): 5 colunas
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6"
        >
          {badges.map((badge) => {
            const isEarned = earnedIds.has(badge.id);
            const Icon = IconMap[badge.icon] || Star;

            return (
              <motion.div
                key={badge.id}
                variants={itemVariants}
                whileHover={isEarned ? { y: -4, scale: 1.02 } : {}}
                className={cn(
                  // CARD RESPONSIVO:
                  // Padding reduzido no mobile (p-3) vs desktop (p-6)
                  "relative flex flex-col items-center p-3 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all group overflow-hidden h-full",
                  "border-b-[3px] sm:border-b-4", // Borda ligeiramente mais fina no mobile
                  isEarned 
                    ? "bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-950/20 dark:to-zinc-900 border-yellow-400 dark:border-yellow-600/50" 
                    : "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 opacity-70"
                )}
              >
                {/* Background Pattern */}
                {isEarned && (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-200/20 via-transparent to-transparent pointer-events-none" />
                )}

                {/* ÍCONE RESPONSIVO: */}
                {/* Mobile: w-12 h-12 (48px) | Desktop: w-20 h-20 (80px) */}
                <div className={cn(
                  "w-12 h-12 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-3 sm:mb-4 shadow-sm relative z-10 border-b-[3px] sm:border-b-4 transition-transform shrink-0",
                  isEarned 
                    ? "bg-yellow-400 border-yellow-600 text-white rotate-0 group-hover:rotate-6 group-hover:scale-110" 
                    : "bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-400 dark:text-zinc-600 grayscale"
                )}>
                  {isEarned 
                    ? <Icon className="w-6 h-6 sm:w-10 sm:h-10 fill-current" /> 
                    : <Lock className="w-5 h-5 sm:w-8 sm:h-8" />
                  }
                  
                  {isEarned && (
                      <div className="absolute top-1 right-2 sm:top-2 sm:right-4 w-1.5 h-1.5 sm:w-3 sm:h-3 bg-white/40 rounded-full blur-[1px]" />
                  )}
                </div>

                {/* TEXTO RESPONSIVO */}
                <div className="relative z-10 text-center flex flex-col items-center flex-1">
                    <h3 className={cn(
                        "font-bold text-xs sm:text-sm leading-tight mb-1 sm:mb-2 line-clamp-2",
                        isEarned ? "text-zinc-800 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-600"
                    )}>
                        {badge.title}
                    </h3>
                    
                    {/* Descrição apenas em telas maiores para limpar o visual mobile */}
                    <p className={cn(
                        "text-[10px] sm:text-xs leading-relaxed hidden sm:block",
                        isEarned ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-400/50 dark:text-zinc-700"
                    )}>
                        {badge.description}
                    </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// SKELETON OTIMIZADO PARA MOBILE
// ------------------------------------------------------------------
function BadgesSkeleton() {
    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 pb-20">
             {/* Header Skeleton */}
             <div className="px-4 py-3 sm:py-4 border-b border-zinc-100 dark:border-zinc-800 mb-4">
                <div className="max-w-4xl mx-auto flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                    <div className="flex-1">
                        <Skeleton className="h-6 w-32 mb-2 rounded-lg" />
                        <Skeleton className="h-2 w-20 rounded-lg" />
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 sm:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                        <div key={i} className="flex flex-col items-center p-3 sm:p-6 rounded-xl border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 h-32 sm:h-48">
                            <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mb-3 sm:mb-4 shrink-0" />
                            <Skeleton className="h-3 sm:h-4 w-16 sm:w-24 mb-2 rounded" />
                            <Skeleton className="h-2 w-20 rounded hidden sm:block" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}