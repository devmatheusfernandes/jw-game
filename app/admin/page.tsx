"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Deck, deleteDeck, getGlobalDecks } from "@/lib/decks";
import { Plus, Edit, Trash2, Globe, Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// TODO: Restrict this in production!
// const ADMIN_EMAILS = ["admin@example.com"];

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
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
      setDecks(decks.filter(d => d.id !== id));
    } catch (error) {
      alert("Erro ao excluir deck");
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 p-4 rounded-lg flex items-center gap-3 text-red-700 dark:text-red-400">
            <ShieldAlert className="w-5 h-5" />
            <p className="text-sm font-medium">Área Administrativa - Você está editando decks globais visíveis para todos.</p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Decks Globais</h1>
            <p className="text-zinc-500 dark:text-zinc-400">Gerencie o conteúdo público do jogo</p>
          </div>
          <Link
            href="/admin/deck/new"
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Novo Deck Global
          </Link>
        </div>

        {decks.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <Globe className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
            <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Nenhum deck global</h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6">Adicione conteúdo oficial para o jogo.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck) => (
              <div key={deck.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 space-y-4 hover:border-red-500/50 transition-colors group">
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">{deck.title}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">{deck.description}</p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs font-medium px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-400">
                    {deck.questions.length} perguntas
                  </span>
                  <div className="flex gap-2">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}