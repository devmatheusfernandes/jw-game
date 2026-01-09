import { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Lightbulb, ChevronRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/components/hooks/use-mobile"

interface HintComponentProps {
  reference: string;
  price: number;
  source?: string;
  onUnlock: () => void;
  isUnlocked: boolean;
  canAfford: boolean;
}

export function HintComponent({
  reference,
  price,
  source,
  onUnlock,
  isUnlocked,
  canAfford,
}: HintComponentProps) {
  const isMobile = useIsMobile();
  const [dragX, setDragX] = useState(0);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100 && canAfford && !isUnlocked) {
      onUnlock();
    }
    setDragX(0);
  };

  if (isUnlocked) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 w-full"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-800/30 rounded-lg text-amber-600 dark:text-amber-400">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-amber-800 dark:text-amber-200 text-sm uppercase mb-1">
              Dica Desbloqueada
            </h4>
            <p className="text-zinc-700 dark:text-zinc-300 font-medium">{reference}</p>
            {source && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 italic">
                Fonte: {source}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Desktop View
  if (!isMobile) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm w-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-400">
                <Lock className="w-5 h-5" />
            </div>
            <div>
                <h4 className="font-bold text-zinc-700 dark:text-zinc-300 text-sm">
                    Precisa de ajuda?
                </h4>
                <p className="text-xs text-zinc-500">
                    Desbloqueie a referência bíblica
                </p>
            </div>
        </div>
        
        <button
            onClick={onUnlock}
            disabled={!canAfford}
            className={cn(
                "px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all",
                canAfford 
                    ? "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300" 
                    : "bg-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-800"
            )}
        >
            <Lightbulb className="w-4 h-4" />
            Ver Dica (-{price} XP)
        </button>
      </div>
    );
  }

  // Mobile Slider View
  return (
    <div className="relative h-14 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden select-none touch-none w-full border border-zinc-200 dark:border-zinc-700">
      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-zinc-400 uppercase tracking-wider z-0 pl-12">
        {canAfford ? `Deslize para ver (-${price} XP)` : "XP Insuficiente"}
      </div>
      
      <motion.div
        drag={canAfford ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }} // Snap back handled by dragElastic usually, but here we check offset
        dragElastic={0.1}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        className={cn(
            "absolute left-1 top-1 bottom-1 w-12 rounded-full flex items-center justify-center shadow-sm z-10 cursor-grab active:cursor-grabbing",
            canAfford ? "bg-amber-500 text-white" : "bg-zinc-300 dark:bg-zinc-700 text-zinc-500"
        )}
      >
        <ChevronRight className="w-6 h-6" />
      </motion.div>
    </div>
  );
}
