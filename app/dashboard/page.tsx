"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Deck, deleteDeck, getUserDecks } from "@/lib/decks";
import { Plus, Edit, Trash2, BookOpen, Loader2, ArrowLeft, LayoutGrid, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      loadDecks();
    }
  }, [user, authLoading, router]);

  async function loadDecks() {
    if (!user) return;
    try {
      const userDecks = await getUserDecks(user.uid);
      setDecks(userDecks);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteDeck(deleteId);
      // Atualiza o estado local removendo o deck deletado
      setDecks((prev) => prev.filter(d => d.id !== deleteId));
      toast.success("Deck excluído com sucesso");
    } catch (error) {
      toast.error("Erro ao excluir deck");
    } finally {
      setDeleteId(null);
    }
  }

  // Variantes de animação para a lista
  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
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
             <div className="p-3 rounded-2xl bg-white/50 dark:bg-zinc-900/50 shadow-xl backdrop-blur-md">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
             </div>
             <p className="text-zinc-500 text-xs font-medium animate-pulse">Carregando seus decks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 min-h-screen relative">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-blue-100/40 to-transparent dark:from-blue-900/10 pointer-events-none" />

      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 relative z-10">
        
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
          <div className="space-y-1">
            <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors mb-2"
            >
                <ArrowLeft className="w-4 h-4" /> Voltar ao Início
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
               <LayoutGrid className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
               Meus Decks
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-md">
               Gerencie suas perguntas e crie novos temas para jogar com seus amigos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/dashboard/deck/new"
              className="group flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:scale-[1.02] active:scale-[0.98] font-medium"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              Novo Deck
            </Link>
          </div>
        </header>

        {/* Content Section */}
        {decks.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 text-center shadow-sm"
          >
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6">
               <BookOpen className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Você ainda não tem decks</h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto mb-8 leading-relaxed">
              Crie seu primeiro conjunto de perguntas personalizadas e comece a diversão.
            </p>
            <Link
              href="/dashboard/deck/new"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors font-medium shadow-sm"
            >
              <Plus className="w-4 h-4" /> Criar Primeiro Deck
            </Link>
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
                    className="group bg-white dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm p-6 flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all duration-300 relative overflow-hidden"
                >
                    {/* Decorative Gradient on Hover */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />

                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-xl text-zinc-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {deck.title}
                            </h3>
                            {deck.isGlobal && (
                                <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-1 rounded-full uppercase font-bold tracking-wider">
                                    Global
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 h-10 leading-relaxed">
                            {deck.description || "Sem descrição definida."}
                        </p>
                        {deck.categories && deck.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {deck.categories.slice(0, 3).map((cat) => (
                              <span key={cat} className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-1 rounded dark:bg-indigo-900/30 dark:text-indigo-300">
                                {cat}
                              </span>
                            ))}
                            {deck.categories.length > 3 && (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 px-2 py-1 rounded dark:bg-zinc-800 dark:text-zinc-400">
                                +{deck.categories.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                        <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-md text-indigo-700 dark:text-indigo-300">
                            <BookOpen className="w-3.5 h-3.5" />
                            {deck.questions.length} {deck.questions.length === 1 ? 'pergunta' : 'perguntas'}
                        </div>
                        
                        <div className="flex items-center gap-1">
                            <Link
                                href={`/dashboard/deck/${deck.id}`}
                                className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                title="Editar Deck"
                            >
                                <Edit className="w-4 h-4" />
                            </Link>
                            <button
                                onClick={() => setDeleteId(deck.id)}
                                className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Excluir Deck"
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

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Deck?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este deck? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
