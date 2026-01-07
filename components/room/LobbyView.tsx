"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Users, Play } from "lucide-react";
import { Room } from "@/types";
import { toast } from "sonner";

interface LobbyViewProps {
  room: Room;
  isHost: boolean;
  onStartGame: () => void;
}

export function LobbyView({ room, isHost, onStartGame }: LobbyViewProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    toast.success("Código copiado para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
        key="lobby"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        className="flex flex-col gap-6"
    >
        <div className="text-center space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
                Aguardando Início
            </span>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">Prepare-se!</h2>
            <p className="text-zinc-500 dark:text-zinc-400">Convide seus amigos para entrar.</p>
        </div>

        {/* Room Code Card */}
        <div 
            onClick={copyToClipboard}
            className="bg-white dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-blue-100 dark:border-blue-900/30 flex flex-col items-center gap-2 cursor-pointer group hover:scale-[1.02] transition-transform"
        >
             <span className="text-xs text-zinc-400 font-medium">CÓDIGO DA SALA</span>
             <div className="flex items-center gap-3">
                <span className="text-5xl font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                    {room.code}
                </span>
             </div>
             <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 group-hover:text-blue-500 transition-colors">
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copiado!" : "Toque para copiar"}
             </div>
        </div>

        {/* Players Grid */}
        <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Jogadores ({room.players.length})
                </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {room.players.map((player) => (
                    <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={player.id} 
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 shadow-sm"
                    >
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {player.name[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">{player.name}</span>
                            {player.isHost && <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">Anfitrião</span>}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>

        {isHost ? (
            <button
                onClick={onStartGame}
                className="w-full mt-4 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
                <Play className="w-5 h-5 fill-current" /> Iniciar Jogo
            </button>
        ) : (
            <div className="mt-4 p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-center text-sm text-zinc-500 animate-pulse">
                O anfitrião iniciará a partida em breve...
            </div>
        )}
    </motion.div>
  );
}
