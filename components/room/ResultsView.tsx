import { motion } from "framer-motion";
import { Trophy, Home, Medal, Crown } from "lucide-react";
import { Room, Player } from "@/types";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/ui/UserAvatar";

interface ResultsViewProps {
  room: Room;
  currentPlayer?: Player;
}

export function ResultsView({ room, currentPlayer }: ResultsViewProps) {
  const router = useRouter();
  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const isWinner = currentPlayer?.id === winner?.id;

  // Top 3 players
  const top3 = sortedPlayers.slice(0, 3);
  const others = sortedPlayers.slice(3);

  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col h-full gap-6 items-center justify-center py-8"
    >
      <div className="text-center space-y-2">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Trophy className="w-20 h-20 text-yellow-400 mx-auto drop-shadow-lg" />
        </motion.div>
        <h1 className="text-3xl font-bold text-zinc-800 dark:text-white">Fim de Jogo!</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Confira o ranking final</p>
      </div>

      <div className="w-full max-w-md space-y-4">
        {/* Podium / Top 3 */}
        <div className="flex justify-center items-end gap-4 min-h-[160px] mb-8">
            {top3[1] && (
                <div className="flex flex-col items-center gap-2">
                    <UserAvatar playerName={top3[1].name} className="h-10 w-10 border-2 border-white dark:border-zinc-700 shadow-sm" />
                    <span className="font-bold text-zinc-600 dark:text-zinc-300 text-sm">{top3[1].name}</span>
                    <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: 100 }}
                        className="w-20 bg-zinc-300 dark:bg-zinc-700 rounded-t-lg flex items-start justify-center pt-2 relative shadow-lg"
                    >
                        <span className="text-3xl font-bold text-zinc-500 dark:text-zinc-400 opacity-50">2</span>
                        <div className="absolute -top-3 w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-600 border-2 border-zinc-300 flex items-center justify-center">
                            <span className="text-xs font-bold">{top3[1].score}</span>
                        </div>
                    </motion.div>
                </div>
            )}
            
            {top3[0] && (
                <div className="flex flex-col items-center gap-2 z-10">
                    <Crown className="w-6 h-6 text-yellow-500 animate-bounce" />
                    <span className="font-bold text-zinc-800 dark:text-white text-lg">{top3[0].name}</span>
                    <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: 140 }}
                        className="w-24 bg-yellow-400 rounded-t-lg flex items-start justify-center pt-2 relative shadow-xl shadow-yellow-400/20"
                    >
                        <span className="text-4xl font-bold text-yellow-600 opacity-50">1</span>
                        <div className="absolute -top-4 w-10 h-10 rounded-full bg-yellow-100 border-4 border-yellow-400 flex items-center justify-center shadow-sm">
                            <span className="text-sm font-bold text-yellow-700">{top3[0].score}</span>
                        </div>
                    </motion.div>
                </div>
            )}

            {top3[2] && (
                <div className="flex flex-col items-center gap-2">
                    <span className="font-bold text-zinc-600 dark:text-zinc-300 text-sm">{top3[2].name}</span>
                    <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: 80 }}
                        className="w-20 bg-amber-700/60 rounded-t-lg flex items-start justify-center pt-2 relative shadow-lg"
                    >
                        <span className="text-3xl font-bold text-amber-900/50 opacity-50">3</span>
                        <div className="absolute -top-3 w-8 h-8 rounded-full bg-amber-100 border-2 border-amber-700/60 flex items-center justify-center">
                            <span className="text-xs font-bold">{top3[2].score}</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>

        {/* List of others */}
        {others.length > 0 && (
            <div className="bg-white/50 dark:bg-zinc-900/50 rounded-xl p-4 space-y-2 max-h-40 overflow-y-auto">
                {others.map((player, idx) => (
                    <div key={player.id} className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-800 shadow-sm">
                        <div className="flex items-center gap-3">
                            <span className="w-6 text-center text-zinc-400 font-mono text-sm">#{idx + 4}</span>
                            <UserAvatar playerName={player.name} className="h-8 w-8" />
                            <span className="font-medium text-zinc-700 dark:text-zinc-200">{player.name}</span>
                        </div>
                        <span className="font-bold text-zinc-500">{player.score} pts</span>
                    </div>
                ))}
            </div>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          localStorage.removeItem("jw-game-room-code");
          localStorage.removeItem("jw-game-player-name");
          localStorage.removeItem("jw-game-player-id");
          router.push("/");
        }}
        className="mt-6 px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold shadow-lg flex items-center gap-2"
      >
        <Home className="w-4 h-4" /> Voltar ao Início
      </motion.button>
    </motion.div>
  );
}
