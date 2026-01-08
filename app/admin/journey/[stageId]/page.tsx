"use client";

import { useState, useEffect, use } from "react";
import { getStages, saveStage, getJourneyDecks, saveJourneyDeck, deleteJourneyDeck } from "@/lib/journey";
import { Stage, Deck } from "@/types/journey";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash, Save, Edit, Loader2 } from "lucide-react";

interface PageProps {
  params: Promise<{
    stageId: string;
  }>;
}

export default function StageEditorPage({ params }: PageProps) {
  const { stageId } = use(params);
  const router = useRouter();
  const isNew = stageId === "new";

  const [stage, setStage] = useState<Partial<Stage>>({
    title: "",
    description: "",
    order: 10,
    color: "bg-blue-500",
    slug: "",
    id: isNew ? undefined : stageId
  });
  
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
        const loadData = async () => {
            try {
                const stages = await getStages();
                const foundStage = stages.find(s => s.id === stageId);
                if (foundStage) {
                    setStage(foundStage);
                    const stageDecks = await getJourneyDecks(stageId);
                    setDecks(stageDecks);
                } else {
                    toast.error("Etapa não encontrada");
                    router.push("/admin/journey");
                }
            } catch (error) {
                console.error(error);
                toast.error("Erro ao carregar dados");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }
  }, [stageId, isNew, router]);

  const handleSaveStage = async () => {
      try {
          setSaving(true);
          if (!stage.title || !stage.slug) {
              toast.error("Título e Slug são obrigatórios");
              return;
          }
          await saveStage(stage, isNew ? undefined : stageId);
          toast.success("Etapa salva com sucesso!");
          if (isNew) {
              router.push("/admin/journey");
          }
      } catch (error) {
          toast.error("Erro ao salvar etapa");
      } finally {
          setSaving(false);
      }
  };

  const handleAddDeck = async () => {
      if (isNew) {
          toast.error("Salve a etapa antes de adicionar decks");
          return;
      }
      
      const newDeck: Deck = {
          id: `deck-${Date.now()}`,
          stageId: stageId,
          title: "Novo Deck",
          description: "Descrição do deck",
          order: decks.length + 1,
          totalQuestions: 0
      };

      try {
          await saveJourneyDeck(newDeck, newDeck.id);
          setDecks([...decks, newDeck]);
          toast.success("Deck criado!");
      } catch (error) {
          toast.error("Erro ao criar deck");
      }
  };

  const handleDeleteDeck = async (deckId: string) => {
      if (!confirm("Excluir deck?")) return;
      try {
          await deleteJourneyDeck(deckId);
          setDecks(decks.filter(d => d.id !== deckId));
          toast.success("Deck removido");
      } catch (error) {
          toast.error("Erro ao remover deck");
      }
  };

  if (loading) return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
           <div className="p-3 rounded-2xl bg-white/50 dark:bg-zinc-900/50 shadow-xl backdrop-blur-md">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
           </div>
        </div>
      </div>);

  return (
    <div className="p-8 max-w-4xl mx-auto pb-20">
        <Button variant="ghost" onClick={() => router.push("/admin/journey")} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>

        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">{isNew ? "Nova Etapa" : "Editar Etapa"}</h1>
            <Button onClick={handleSaveStage} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Salvando..." : "Salvar Etapa"}
            </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="space-y-2">
                <label className="text-sm font-medium">Título</label>
                <div className="flex">
                    <input 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={stage.title || ""}
                        onChange={e => setStage({...stage, title: e.target.value})}
                        placeholder="Ex: Visitante"
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Slug (ID URL)</label>
                <div className="flex">
                    <input 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={stage.slug || ""}
                        onChange={e => setStage({...stage, slug: e.target.value})}
                        placeholder="Ex: visitante"
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Ordem</label>
                <div className="flex">
                    <input 
                        type="number"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={stage.order || 0}
                        onChange={e => setStage({...stage, order: parseInt(e.target.value)})}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Cor do Tema</label>
                <div className="flex flex-wrap gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
                    {[
                        "bg-red-500", "bg-orange-500", "bg-amber-500", 
                        "bg-yellow-500", "bg-lime-500", "bg-green-500", 
                        "bg-emerald-500", "bg-teal-500", "bg-cyan-500", 
                        "bg-sky-500", "bg-blue-500", "bg-indigo-500", 
                        "bg-violet-500", "bg-purple-500", "bg-fuchsia-500", 
                        "bg-pink-500", "bg-rose-500", "bg-zinc-500"
                    ].map((color) => (
                        <button
                            key={color}
                            type="button"
                            onClick={() => setStage({ ...stage, color })}
                            className={`w-8 h-8 rounded-full ${color} transition-all hover:scale-110 ${
                                stage.color === color 
                                    ? "ring-2 ring-offset-2 ring-zinc-900 dark:ring-white scale-110 shadow-lg" 
                                    : "hover:ring-2 hover:ring-offset-1 hover:ring-zinc-300 dark:hover:ring-zinc-700 opacity-80 hover:opacity-100"
                            }`}
                            title={color}
                        />
                    ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-zinc-500">Cor selecionada:</span>
                    <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-400 font-mono">
                        {stage.color || "Nenhuma"}
                    </code>
                </div>
            </div>
            <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="text-sm font-medium">Descrição</label>
                <textarea 
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={stage.description || ""}
                    onChange={e => setStage({...stage, description: e.target.value})}
                />
            </div>
        </div>

        {!isNew && (
            <div className="border-t pt-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Decks ({decks.length})</h2>
                    <Button variant="outline" onClick={handleAddDeck}>
                        <Plus className="w-4 h-4 mr-2" /> Adicionar Deck
                    </Button>
                </div>

                <div className="space-y-4">
                    {decks.map(deck => (
                        <div key={deck.id} className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border">
                             <div className="flex-1">
                                 <input 
                                    className="font-bold bg-transparent border-none focus:outline-none w-full mb-1"
                                    value={deck.title}
                                    onChange={(e) => {
                                        const newDecks = decks.map(d => d.id === deck.id ? { ...d, title: e.target.value } : d);
                                        setDecks(newDecks);
                                    }}
                                    onBlur={() => saveJourneyDeck(deck, deck.id)} // Auto-save on blur
                                 />
                                 <input 
                                    className="text-sm text-zinc-500 bg-transparent border-none focus:outline-none w-full"
                                    value={deck.description || ""}
                                    onChange={(e) => {
                                        const newDecks = decks.map(d => d.id === deck.id ? { ...d, description: e.target.value } : d);
                                        setDecks(newDecks);
                                    }}
                                    onBlur={() => saveJourneyDeck(deck, deck.id)}
                                 />
                             </div>
                             <div className="flex items-center gap-2">
                                <span className="text-xs text-zinc-400">Ordem: {deck.order}</span>
                                <Button variant="outline" size="sm" onClick={() => router.push(`/admin/journey/${stageId}/deck/${deck.id}`)}>
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteDeck(deck.id)}>
                                    <Trash className="w-4 h-4" />
                                </Button>
                             </div>
                        </div>
                    ))}
                    {decks.length === 0 && <p className="text-zinc-500 text-center">Nenhum deck nesta etapa.</p>}
                </div>
            </div>
        )}
    </div>
  );
}
