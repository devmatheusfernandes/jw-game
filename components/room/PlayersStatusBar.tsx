"use client";

import { Player } from "@/types";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PlayersStatusBarProps {
  players: Player[];
}

export function PlayersStatusBar({ players }: PlayersStatusBarProps) {
  // Ordena os jogadores: primeiro quem já respondeu, depois quem falta (opcional, mas visualmente agradável)
  // Ou mantém a ordem original para não ficar pulando. Manter ordem original é melhor para estabilidade visual.
  // Vamos apenas filtrar os conectados se necessário, mas o tipo Room já deve trazer os relevantes.
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex flex-wrap justify-center gap-3 py-4"
    >
      {players.map((player) => {
        const hasAnswered = player.currentAnswer !== undefined && player.currentAnswer !== null;
        
        return (
          <div key={player.id} className="flex flex-col items-center gap-1">
            <div className={cn(
              "p-0.5 rounded-full transition-all duration-300",
              hasAnswered 
                ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" 
                : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse"
            )}>
              <UserAvatar 
                playerName={player.name} 
                className="w-10 h-10 border-2 border-white dark:border-zinc-900" 
              />
            </div>
            <span className={cn(
              "text-[10px] font-bold max-w-[60px] truncate transition-colors",
              hasAnswered ? "text-green-600 dark:text-green-400" : "text-zinc-500 dark:text-zinc-400"
            )}>
              {player.name}
            </span>
          </div>
        );
      })}
    </motion.div>
  );
}
