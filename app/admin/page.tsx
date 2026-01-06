"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Deck, deleteDeck, getGlobalDecks } from "@/lib/decks";
import { Plus, Edit, Trash2, Globe, Loader2, ShieldAlert, ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDecks();
    }
  }, [user]);

  async function loadDecks() {
    try {
      const globalDecks = await getGlobalDecks();
      setDecks(globalDecks);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este deck global? Isso afetará todos os jogadores.")) return;
    try {
      await deleteDeck(id);
      setDecks((prev) => prev.filter(d => d.id !== id));
    } catch (error) {
      alert("Erro ao excluir deck");
    }
  }

  // Variantes de animação
  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
             <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 shadow-xl backdrop-blur-md">
                <Loader2 className="h-8 w-8 animate-spin text-red-600" />
             </div>
             <p className="text-zinc-500 text-xs font-medium animate-pulse">Carregando área restrita...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-zinc-50 via-white to-red-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-red-950/20 relative overflow-hidden">
      
      {/* Background Decor (Red tinted for Admin) */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 relative z-10">
        
        {/* Header Section */}
        <header className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <Link 
                    href="/dashboard" 
                    className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Voltar ao Dashboard
                </Link>
                <div className="flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 rounded-full border border-red-200 dark:border-red-800">
                    <Lock className="w-3 h-3 text-red-700 dark:text-red-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-400">Admin Mode</span>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                        <Globe className="w-8 h-8 text-red-600" />
                        Decks Globais
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-lg">
                        Gerencie o conteúdo oficial visível para todos os jogadores. Alterações aqui impactam toda a plataforma.
                    </p>
                </div>

                <Link
                    href="/admin/deck/new"
                    className="group flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 hover:shadow-red-600/40 hover:scale-[1.02] active:scale-[0.98] font-medium"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    Novo Deck Global
                </Link>
            </div>
        </header>

        {/* Warning Banner */}
        <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 p-4 rounded-xl flex items-start gap-3"
        >
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
                <p className="font-bold text-amber-800 dark:text-amber-400">Área Sensível</p>
                <p className="text-amber-700/80 dark:text-amber-500/80">
                    Qualquer exclusão ou edição feita nesta página é permanente e imediata para todos os usuários ativos.
                </p>
            </div>
        </motion.div>

        {/* Content Section */}
        {decks.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 text-center"
          >
            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
               <Globe className="w-10 h-10 text-zinc-400" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Nenhum deck global</h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto mb-8">
              O banco de dados oficial está vazio. Adicione o primeiro deck público.
            </p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVars}
            initial="hidden"
            animate="show"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
                {decks.map((deck) => (
                <motion.div
                    layout
                    variants={itemVars}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={deck.id}
                    className="group bg-white dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 flex flex-col justify-between hover:border-red-300 dark:hover:border-red-900 hover:shadow-xl hover:shadow-red-900/5 transition-all duration-300 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Globe className="w-16 h-16 text-red-600" />
                    </div>

                    <div className="space-y-3 mb-6 relative z-10">
                        <h3 className="font-bold text-xl text-zinc-900 dark:text-white line-clamp-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                            {deck.title}
                        </h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 h-10 leading-relaxed">
                            {deck.description || "Sem descrição."}
                        </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800/50 relative z-10">
                        <div className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md text-zinc-600 dark:text-zinc-400">
                            {deck.questions.length} perguntas
                        </div>
                        
                        <div className="flex items-center gap-1">
                            <Link
                                href={`/admin/deck/${deck.id}`}
                                className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Editar"
                            >
                                <Edit className="w-4 h-4" />
                            </Link>
                            <button
                                onClick={() => handleDelete(deck.id)}
                                className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Excluir"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
                ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}