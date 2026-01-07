"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Users, LogOut, LayoutDashboard, LogIn, Gamepad2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SavedSessionAlert } from "@/components/home/SavedSessionAlert";
import { JoinGameForm } from "@/components/home/JoinGameForm";
import { CreateGameForm } from "@/components/home/CreateGameForm";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function Home() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('join');
  
  const [savedSession, setSavedSession] = useState<{ code: string, name: string } | null>(() => {
    if (typeof window === "undefined") return null;
    const code = window.localStorage.getItem("jw-game-room-code");
    const name = window.localStorage.getItem("jw-game-player-name");
    const id = window.localStorage.getItem("jw-game-player-id");
    if (code && name && id) {
      return { code, name };
    }
    return null;
  });

  const handleReconnect = () => {
    if (savedSession) {
      router.push(`/room/${savedSession.code}`);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="absolute top-0 w-full p-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
           {/* Mobile Logo placeholder if needed */}
        </div>
        
        {user ? (
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 dark:bg-zinc-800/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 shadow-sm hover:scale-105 transition-all"
              title="Dashboard"
            >
              <LayoutDashboard className="w-5 h-5" />
            </Link>
            <button
              onClick={() => logout()}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 backdrop-blur-md border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 shadow-sm hover:scale-105 transition-all"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md rounded-full text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm border border-indigo-100 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 transition-all text-sm"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Link>
          </div>
        )}
      </header>

      <main className="w-full max-w-md space-y-6 z-10 pt-10">
        
        {/* Title Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20 mb-2">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            JW <span className="text-blue-600 dark:text-blue-400">GAME</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
            Teste seu estudo pessoal
          </p>
        </motion.div>

        {/* Saved Session Alert */}
        <SavedSessionAlert savedSession={savedSession} onReconnect={handleReconnect} />

        {/* Main Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 bg-white dark:bg-zinc-900/90 backdrop-blur-xl rounded-3xl shadow-xl border border-zinc-200/60 dark:border-zinc-800 overflow-hidden ring-1 ring-zinc-900/5"
        >
          {/* Custom Tabs */}
          <div className="flex p-2 gap-2 bg-zinc-50/50 dark:bg-zinc-950/50 border-b border-zinc-100 dark:border-zinc-800/50">
            {(['join', 'create'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "relative flex-1 py-3 text-sm font-semibold rounded-xl transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  activeTab === tab ? "text-blue-700 dark:text-blue-300" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                )}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200/50 dark:border-zinc-700 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {tab === 'join' ? <Users className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4" />}
                  {tab === 'join' ? 'Entrar' : 'Criar Sala'}
                </span>
              </button>
            ))}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'join' ? (
                <JoinGameForm />
              ) : (
                <CreateGameForm userId={user?.uid} />
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-4 text-center z-10">
        <p className="text-xs text-zinc-400 dark:text-zinc-600">
          Jw Game v1.0
        </p>
      </footer>
    </div>
  );
}
