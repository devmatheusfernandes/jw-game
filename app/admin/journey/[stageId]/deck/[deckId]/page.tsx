"use client";

import { useState, useEffect, use } from "react";
import { getJourneyDecks, saveJourneyDeck } from "@/lib/journey";
import { Deck } from "@/types/journey";
import { Question, QuestionType } from "@/types";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash, Save, Loader2, Upload } from "lucide-react";

interface PageProps {
  params: Promise<{
    stageId: string;
    deckId: string;
  }>;
}

export default function DeckEditorPage({ params }: PageProps) {
  const { stageId, deckId } = use(params);
  const router = useRouter();

  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadDeck = async () => {
      try {
        const decks = await getJourneyDecks(); // Optimally should filter by stage or id
        const foundDeck = decks.find(d => d.id === deckId);
        
        if (foundDeck) {
            setDeck(foundDeck);
        } else {
            // New deck logic usually handled by parent, but if direct link...
            // For now assume existing deck or created via parent
            toast.error("Deck não encontrado");
            router.push(`/admin/journey/${stageId}`);
        }
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar deck");
      } finally {
        setLoading(false);
      }
    };
    loadDeck();
  }, [deckId, stageId, router]);

  const handleSave = async () => {
    if (!deck) return;
    setSaving(true);
    try {
        await saveJourneyDeck({
            ...deck,
            totalQuestions: deck.questions?.length || 0
        }, deck.id);
        toast.success("Deck salvo com sucesso!");
    } catch (error) {
        toast.error("Erro ao salvar deck");
    } finally {
        setSaving(false);
    }
  };

  const addQuestion = () => {
    if (!deck) return;
    const newQuestion: Question = {
        id: `q-${Date.now()}`,
        text: "",
        type: "multiple_choice",
        options: ["Opção 1", "Opção 2"],
        correctAnswer: "Opção 1",
        reference: "",
        referencePrice: 20
    };
    setDeck({
        ...deck,
        questions: [...(deck.questions || []), newQuestion]
    });
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
      if (!deck || !deck.questions) return;
      const newQuestions = [...deck.questions];
      newQuestions[index] = { ...newQuestions[index], ...updates };
      setDeck({ ...deck, questions: newQuestions });
  };

  const removeQuestion = (index: number) => {
      if (!deck || !deck.questions) return;
      if (!confirm("Remover esta questão?")) return;
      const newQuestions = [...deck.questions];
      newQuestions.splice(index, 1);
      setDeck({ ...deck, questions: newQuestions });
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!deck) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!Array.isArray(json)) {
            throw new Error("O arquivo deve conter um array de perguntas");
        }

        const newQuestions: Question[] = json.map((item: any, idx: number) => ({
            id: `q-${Date.now()}-${idx}`,
            text: item.text || "Pergunta importada",
            type: item.type || "multiple_choice",
            options: item.options || [],
            correctAnswer: item.correctAnswer,
            timeLimit: item.timeLimit || 30,
            reference: item.reference,
            referencePrice: item.referencePrice
        }));

        setDeck({
            ...deck,
            questions: [...(deck.questions || []), ...newQuestions]
        });
        toast.success(`${newQuestions.length} perguntas importadas!`);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao ler arquivo JSON");
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = "";
  };

  if (loading) return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
           <div className="p-3 rounded-2xl bg-white/50 dark:bg-zinc-900/50 shadow-xl backdrop-blur-md">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
           </div>
        </div>
      </div>);
  if (!deck) return <div>Deck não encontrado</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto pb-20">
        <Button variant="ghost" onClick={() => router.push(`/admin/journey/${stageId}`)} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Etapa
        </Button>

        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Editar Deck</h1>
            <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Salvando..." : "Salvar Deck"}
            </Button>
        </div>

        {/* Deck Metadata */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm mb-8 space-y-4">
            <h2 className="text-xl font-bold mb-4">Informações Básicas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Título</label>
                    <input 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={deck.title}
                        onChange={e => setDeck({...deck, title: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Ordem</label>
                    <input 
                        type="number"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={deck.order}
                        onChange={e => setDeck({...deck, order: parseInt(e.target.value)})}
                    />
                </div>
                <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-sm font-medium">Descrição</label>
                    <textarea 
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={deck.description || ""}
                        onChange={e => setDeck({...deck, description: e.target.value})}
                    />
                </div>
            </div>
        </div>

        {/* Questions Editor */}
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Questões ({deck.questions?.length || 0})</h2>
                <div className="flex gap-2">
                    <label className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                        <Upload className="w-4 h-4 mr-2" /> Importar JSON
                        <input type="file" className="hidden" accept=".json" onChange={handleImportJson} />
                    </label>
                    <Button variant="outline" onClick={addQuestion}>
                        <Plus className="w-4 h-4 mr-2" /> Adicionar Questão
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {deck.questions?.map((q, idx) => (
                    <div key={q.id} className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative group">
                        <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeQuestion(idx)}>
                                <Trash className="w-4 h-4" />
                            </Button>
                        </div>
                        
                        <div className="space-y-4 pr-10">
                            <div className="flex gap-4">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 font-bold text-sm shrink-0">
                                    {idx + 1}
                                </div>
                                <div className="flex-1 space-y-4">
                                    <input 
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium"
                                        value={q.text}
                                        onChange={e => updateQuestion(idx, { text: e.target.value })}
                                        placeholder="Pergunta..."
                                    />
                                    
                                    <div className="flex gap-4">
                                        <select 
                                            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={q.type}
                                            onChange={e => updateQuestion(idx, { type: e.target.value as QuestionType })}
                                        >
                                            <option value="multiple_choice">Múltipla Escolha</option>
                                            <option value="true_false">Verdadeiro / Falso</option>
                                        </select>
                                        <input 
                                            type="number"
                                            className="w-24 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            placeholder="Tempo (s)"
                                            value={q.timeLimit || 30}
                                            onChange={e => updateQuestion(idx, { timeLimit: parseInt(e.target.value) })}
                                            title="Tempo limite em segundos"
                                        />
                                    </div>

                                    <div className="grid grid-cols-[1fr_150px] gap-4">
                                        <input 
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={q.reference || ""}
                                            onChange={e => updateQuestion(idx, { reference: e.target.value })}
                                            placeholder="Referência / Dica (Opcional)"
                                        />
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-zinc-500">Preço:</span>
                                            <input 
                                                type="number"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={q.referencePrice || 20}
                                                onChange={e => updateQuestion(idx, { referencePrice: parseInt(e.target.value) })}
                                                placeholder="20"
                                                disabled={!q.reference}
                                            />
                                        </div>
                                    </div>

                                    {/* Options Logic */}
                                    {q.type === 'multiple_choice' ? (
                                        <div className="space-y-2 pl-4 border-l-2 border-zinc-100 dark:border-zinc-800">
                                            <label className="text-xs font-bold text-zinc-500 uppercase">Opções</label>
                                            {q.options?.map((opt, optIdx) => (
                                                <div key={optIdx} className="flex gap-2 items-center">
                                                    <div className={`w-4 h-4 rounded-full border ${opt === q.correctAnswer ? "bg-green-500 border-green-500" : "border-zinc-300"}`} />
                                                    <input 
                                                        className="flex-1 h-8 rounded-md border border-input bg-background px-2 text-sm"
                                                        value={opt}
                                                        onChange={e => {
                                                            const newOptions = [...(q.options || [])];
                                                            newOptions[optIdx] = e.target.value;
                                                            // Also update correct answer if it matches the old value
                                                            let newCorrect = q.correctAnswer;
                                                            if (q.correctAnswer === opt) newCorrect = e.target.value;
                                                            
                                                            updateQuestion(idx, { options: newOptions, correctAnswer: newCorrect });
                                                        }}
                                                    />
                                                    <Button 
                                                        size="sm" 
                                                        variant={opt === q.correctAnswer ? "default" : "ghost"}
                                                        onClick={() => updateQuestion(idx, { correctAnswer: opt })}
                                                        className={opt === q.correctAnswer ? "bg-green-500 hover:bg-green-600" : ""}
                                                    >
                                                        Correta
                                                    </Button>
                                                    <Button 
                                                        size="icon" 
                                                        variant="ghost" 
                                                        className="h-8 w-8 text-red-400"
                                                        onClick={() => {
                                                            const newOptions = q.options?.filter((_, i) => i !== optIdx);
                                                            updateQuestion(idx, { options: newOptions });
                                                        }}
                                                    >
                                                        <Trash className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => updateQuestion(idx, { options: [...(q.options || []), `Opção ${(q.options?.length || 0) + 1}`] })}
                                            >
                                                <Plus className="w-3 h-3 mr-2" /> Adicionar Opção
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-4 items-center">
                                            <label className="text-sm font-medium">Resposta Correta:</label>
                                            <div className="flex gap-2">
                                                <Button 
                                                    variant={q.correctAnswer === true || String(q.correctAnswer) === 'true' ? "default" : "outline"}
                                                    onClick={() => updateQuestion(idx, { correctAnswer: true })}
                                                    className={q.correctAnswer === true || String(q.correctAnswer) === 'true' ? "bg-green-500" : ""}
                                                >
                                                    Verdadeiro
                                                </Button>
                                                <Button 
                                                    variant={q.correctAnswer === false || String(q.correctAnswer) === 'false' ? "default" : "outline"}
                                                    onClick={() => updateQuestion(idx, { correctAnswer: false })}
                                                    className={q.correctAnswer === false || String(q.correctAnswer) === 'false' ? "bg-red-500" : ""}
                                                >
                                                    Falso
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {(!deck.questions || deck.questions.length === 0) && (
                    <div className="text-center py-8 text-zinc-500 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                        Nenhuma questão adicionada ainda.
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
