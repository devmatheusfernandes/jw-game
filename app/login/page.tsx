"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Chrome, Gamepad2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
           <div className="p-3 rounded-2xl bg-white/50 dark:bg-zinc-900/50 shadow-xl backdrop-blur-md">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
           </div>
           <p className="text-zinc-500 text-xs font-medium animate-pulse">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-400/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Back Button (Mobile Friendly) */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 p-2 rounded-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 transition-all shadow-sm z-20"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, type: "spring" }}
        className="w-full max-w-md bg-white/70 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-900/5 border border-white/50 dark:border-zinc-800 p-8 text-center relative z-10"
      >
        
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-600/20">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="space-y-2 mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Bem-vindo ao <span className="text-blue-600 dark:text-blue-400">JW Game</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[280px] mx-auto">
            Faça login para criar salas, gerenciar seus decks e acompanhar seu histórico.
          </p>
        </div>

        <button
          onClick={signInWithGoogle}
          className="group w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-700 text-zinc-800 dark:text-zinc-100 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] font-semibold"
        >
          <Chrome className="w-5 h-5 text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors" />
          <span>Continuar com Google</span>
        </button>

        <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
            <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-normal">
            Ao continuar, você concorda com nossos <a href="#" className="underline hover:text-zinc-600 dark:hover:text-zinc-300">Termos de Serviço</a> e <a href="#" className="underline hover:text-zinc-600 dark:hover:text-zinc-300">Política de Privacidade</a>.
            </p>
        </div>
      </motion.div>

      {/* Footer Branding */}
      <div className="absolute bottom-4 text-center w-full z-0 opacity-40">
        <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-400">Secure Authentication</p>
      </div>

    </div>
  );
}