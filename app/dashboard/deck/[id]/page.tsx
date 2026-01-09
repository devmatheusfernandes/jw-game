"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Deck, getDeckById, saveDeck } from "@/lib/decks";
import { getCategories, ensureCategories, Category } from "@/lib/categories";
import { Question } from "@/types";
import { generateUUID } from "@/lib/utils";
import { ArrowLeft, Plus, Save, Trash2, Clock, CheckCircle, X, Edit, Layers, Type, Check, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function DeckEditor() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const deckId = params.id as string;
  const isNew = deckId === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);

  // Deck State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  // Question Editor State
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [qText, setQText] = useState("");
  const [qType, setQType] = useState<"multiple_choice" | "true_false">("multiple_choice");
  const [qOptions, setQOptions] = useState(["", "", "", ""]);
  const [qCorrect, setQCorrect] = useState(""); 
  const [qTime, setQTime] = useState(30);
  const [qReference, setQReference] = useState("");
  const [qReferencePrice, setQReferencePrice] = useState(20);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (!isNew && user) {
      loadDeck();
    }
  }, [deckId, isNew, user, authLoading]);

  useEffect(() => {
    async function loadCategories() {
      const cats = await getCategories();
      setAllCategories(cats);
    }
    loadCategories();
  }, []);

  async function loadDeck() {
    try {
      const deck = await getDeckById(deckId);
      if (deck) {
        if (deck.ownerId !== "global" && deck.ownerId !== user?.uid) {
          toast.error("Você não tem permissão para editar este deck");
          router.push("/dashboard");
          return;
        }
        setTitle(deck.title);
        setDescription(deck.description);
        setQuestions(deck.questions);
        setSelectedCategories(deck.categories || []);
      } else {
        toast.error("Deck não encontrado");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function handleSaveQuestion() {
    if (!qText) {
      toast.error("Digite a pergunta");
      return;
    }
    if (qType === "multiple_choice") {
      if (qOptions.some(o => !o.trim())) {
        toast.error("Preencha todas as opções");
        return;
      }
      if (!qCorrect) {
        toast.error("Selecione a resposta correta");
        return;
      }
    }

    const newQuestion: Question = {
      id: editingQuestionId || generateUUID(),
      text: qText,
      type: qType,
      correctAnswer: qType === "multiple_choice" ? qCorrect : (qCorrect === "true"),
      timeLimit: qTime,
      reference: qReference || undefined,
      referencePrice: qReference ? qReferencePrice : undefined,
      ...(qType === "multiple_choice" ? { options: qOptions } : {})
    };

    if (editingQuestionId) {
      setQuestions(questions.map(q => q.id === editingQuestionId ? newQuestion : q));
    } else {
      setQuestions([...questions, newQuestion]);
    }

    resetQuestionForm();
  }

  function editQuestion(q: Question) {
    setEditingQuestionId(q.id);
    setQText(q.text);
    setQType(q.type);
    if (q.type === "multiple_choice") {
        setQOptions(q.options || ["", "", "", ""]);
        setQCorrect(q.correctAnswer as string);
    } else {
        setQCorrect(String(q.correctAnswer));
    }
    setQTime(q.timeLimit ?? 30);
    setQReference(q.reference || "");
    setQReferencePrice(q.referencePrice || 20);
    
    // Scroll to editor
    window.scrollTo({ top: 200, behavior: 'smooth' });
  }

  function handleDeleteQuestion() {
    if (deleteQuestionId) {
      setQuestions(questions.filter(q => q.id !== deleteQuestionId));
      setDeleteQuestionId(null);
    }
  }

  function resetQuestionForm() {
    setEditingQuestionId(null);
    setQText("");
    setQType("multiple_choice");
    setQOptions(["", "", "", ""]);
    setQCorrect("");
    setQTime(30);
    setQReference("");
    setQReferencePrice(20);
  }

  async function handleSaveDeck() {
    if (!title) {
      toast.error("Digite um título");
      return;
    }
    if (questions.length === 0) {
      toast.error("Adicione pelo menos uma pergunta");
      return;
    }
    if (!user) return;

    setSaving(true);
    try {
      await ensureCategories(selectedCategories, user.uid);
      await saveDeck({
        title,
        description,
        questions,
        ownerId: user.uid,
        isGlobal: false,
        categories: selectedCategories
      }, isNew ? undefined : deckId);
      toast.success("Deck salvo com sucesso!");
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar deck");
    } finally {
      setSaving(false);
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
         <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 pb-24 relative">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Link href="/dashboard" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                </Link>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white hidden sm:block">
                    {isNew ? "Criar Novo Deck" : "Editar Deck"}
                </h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                  onClick={handleSaveDeck}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-600/20 hover:bg-green-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
              >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? "Salvando..." : "Salvar Deck"}
              </button>
            </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-8 relative z-10">
        
        {/* Deck Info Card */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
             <Layers className="w-5 h-5" />
             <h2 className="font-bold text-lg">Informações do Deck</h2>
          </div>
        <div className="space-y-4">
          <div>
              <label className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400 ml-1">Título do Deck</label>
              <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full h-12 px-4 mt-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-lg placeholder:font-normal"
                  placeholder="Ex: Heróis da Bíblia"
              />
          </div>
          <div>
              <label className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400 ml-1">Descrição</label>
              <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-3 mt-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all min-h-[80px]"
                  placeholder="Sobre o que é este quiz?"
              />
          </div>
          <div>
              <label className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400 ml-1">Categorias</label>
              <div className="mt-1 space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    value={categoryInput}
                    onChange={e => setCategoryInput(e.target.value)}
                    placeholder="Digite para adicionar ou selecione sugeridas..."
                    className="w-full h-10 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const name = categoryInput.trim();
                        if (name && !selectedCategories.includes(name)) {
                          setSelectedCategories([...selectedCategories, name]);
                        }
                        setCategoryInput("");
                      }
                    }}
                  />
                  {categoryInput && (
                    <div className="z-20 mt-1 w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-sm max-h-40 overflow-y-auto">
                      {allCategories
                        .filter(c => c.name.toLowerCase().includes(categoryInput.toLowerCase()))
                        .filter(c => !selectedCategories.includes(c.name))
                        .slice(0, 6)
                        .map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setSelectedCategories([...selectedCategories, c.name]);
                              setCategoryInput("");
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700"
                          >
                            {c.name}
                          </button>
                        ))
                      }
                      {allCategories.filter(c => c.name.toLowerCase().includes(categoryInput.toLowerCase())).length === 0 && (
                        <div className="px-3 py-2 text-xs text-zinc-400">Pressione Enter para adicionar: {categoryInput}</div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map(cat => (
                    <span key={cat} className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {cat}
                      <button
                        type="button"
                        className="text-indigo-600 dark:text-indigo-400"
                        onClick={() => setSelectedCategories(selectedCategories.filter(c => c !== cat))}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
          </div>
        </div>
      </motion.div>

        {/* Question Editor Card */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={cn(
                "bg-white dark:bg-zinc-900 rounded-2xl border-2 p-6 shadow-xl transition-all relative overflow-hidden",
                editingQuestionId ? "border-amber-400 ring-4 ring-amber-400/10" : "border-indigo-100 dark:border-indigo-900/30"
            )}
        >
          {editingQuestionId && (
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-400" />
          )}

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
                <div className={cn("p-2 rounded-lg text-white", editingQuestionId ? "bg-amber-500" : "bg-indigo-600")}>
                    <Plus className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-lg text-zinc-900 dark:text-white">
                    {editingQuestionId ? "Editando Pergunta" : "Adicionar Pergunta"}
                </h2>
            </div>
            {editingQuestionId && (
              <button 
                onClick={resetQuestionForm} 
                className="text-xs font-medium text-zinc-500 hover:text-red-500 flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-full transition-colors"
              >
                <X className="w-3 h-3" /> Cancelar
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* Pergunta e Tempo */}
            <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
                <div>
                    <label className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400 ml-1">Pergunta</label>
                    <input
                        type="text"
                        value={qText}
                        onChange={e => setQText(e.target.value)}
                        className="w-full h-12 px-4 mt-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium"
                        placeholder="Digite a pergunta aqui..."
                    />
                </div>
                <div>
                    <label className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400 ml-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Tempo (s)
                    </label>
                    <input
                        type="number"
                        min="5"
                        max="300"
                        value={qTime}
                        onChange={e => setQTime(Number(e.target.value))}
                        className="w-full h-12 px-4 mt-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-center font-mono font-bold"
                    />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_150px]">
                <div>
                    <label className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400 ml-1">Referência / Dica (Opcional)</label>
                    <input
                        type="text"
                        value={qReference}
                        onChange={e => setQReference(e.target.value)}
                        className="w-full h-12 px-4 mt-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-medium"
                        placeholder="Ex: João 3:16"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400 ml-1 flex items-center gap-1">
                        Preço (Pontos)
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={qReferencePrice}
                        onChange={e => setQReferencePrice(Number(e.target.value))}
                        className="w-full h-12 px-4 mt-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-center font-mono font-bold"
                        disabled={!qReference}
                    />
                </div>
            </div>

            {/* Selector de Tipo */}
            <div className="p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex">
                <button
                    onClick={() => setQType("multiple_choice")}
                    className={cn(
                        "flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
                        qType === "multiple_choice" 
                            ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-sm" 
                            : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    )}
                >
                    <Type className="w-4 h-4" /> Múltipla Escolha
                </button>
                <button
                    onClick={() => setQType("true_false")}
                    className={cn(
                        "flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
                        qType === "true_false" 
                            ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-sm" 
                            : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    )}
                >
                    <CheckCircle className="w-4 h-4" /> Verdadeiro / Falso
                </button>
            </div>

            {/* Área de Respostas */}
            <div className="bg-zinc-50/50 dark:bg-zinc-800/30 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                {qType === "multiple_choice" ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between mb-2">
                             <span className="text-xs font-bold uppercase text-zinc-500">Opções</span>
                             <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">Marque a correta</span>
                        </div>
                        {qOptions.map((opt, idx) => (
                            <div key={idx} className="flex items-center gap-2 group">
                                <button
                                    onClick={() => setQCorrect(opt)}
                                    className={cn(
                                        "w-10 h-10 flex-shrink-0 rounded-lg border-2 flex items-center justify-center transition-all",
                                        qCorrect === opt && opt !== "" 
                                            ? "bg-green-500 border-green-500 text-white shadow-md shadow-green-500/20" 
                                            : "border-zinc-300 dark:border-zinc-600 text-zinc-300 hover:border-zinc-400 bg-white dark:bg-zinc-800"
                                    )}
                                    title="Marcar como correta"
                                >
                                    <Check className="w-5 h-5" />
                                </button>
                                <input
                                    type="text"
                                    value={opt}
                                    onChange={e => {
                                        const newOptions = [...qOptions];
                                        newOptions[idx] = e.target.value;
                                        setQOptions(newOptions);
                                        if (qCorrect === opt) setQCorrect(e.target.value);
                                    }}
                                    className={cn(
                                        "flex-1 h-10 px-4 rounded-lg border bg-white dark:bg-zinc-800 focus:outline-none transition-all text-sm",
                                        qCorrect === opt && opt !== ""
                                            ? "border-green-500 ring-1 ring-green-500 text-green-700 dark:text-green-400 font-medium"
                                            : "border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    )}
                                    placeholder={`Opção ${idx + 1}`}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        <span className="text-xs font-bold uppercase text-zinc-500">Selecione a resposta correta</span>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setQCorrect("true")}
                                className={cn(
                                    "flex-1 py-4 rounded-xl border-2 font-bold text-lg transition-all flex items-center justify-center gap-2",
                                    qCorrect === "true"
                                        ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20"
                                        : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 hover:bg-green-50 dark:hover:bg-zinc-700"
                                )}
                            >
                                Verdadeiro
                            </button>
                            <button
                                onClick={() => setQCorrect("false")}
                                className={cn(
                                    "flex-1 py-4 rounded-xl border-2 font-bold text-lg transition-all flex items-center justify-center gap-2",
                                    qCorrect === "false"
                                        ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20"
                                        : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 hover:bg-red-50 dark:hover:bg-zinc-700"
                                )}
                            >
                                Falso
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <button
                onClick={handleSaveQuestion}
                className={cn(
                    "w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2",
                    editingQuestionId 
                        ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20" 
                        : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
                )}
            >
                {editingQuestionId ? <CheckCircle className="w-5 h-5"/> : <Plus className="w-5 h-5"/>}
                {editingQuestionId ? "Atualizar Pergunta" : "Adicionar à Lista"}
            </button>
          </div>
        </motion.div>

        {/* Questions List */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
               Lista de Perguntas 
               <span className="text-sm font-bold text-white bg-zinc-400 dark:bg-zinc-700 px-2 py-0.5 rounded-full">{questions.length}</span>
            </h2>
          </div>
          
          <div className="space-y-3 min-h-[100px]">
            <AnimatePresence mode="popLayout">
                {questions.map((q, idx) => (
                <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={q.id}
                    className={cn(
                        "group bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-zinc-200 dark:border-zinc-800 flex items-center gap-4 transition-all",
                        editingQuestionId === q.id && "ring-2 ring-amber-400 border-amber-400 bg-amber-50/50 dark:bg-amber-900/10"
                    )}
                >
                    <div className="flex-shrink-0 w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-sm font-bold text-zinc-500">
                        {idx + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-zinc-800 dark:text-zinc-200 truncate">{q.text}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className={cn(
                                "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded",
                                q.type === 'multiple_choice' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                            )}>
                                {q.type === 'multiple_choice' ? 'Múltipla Escolha' : 'V/F'}
                            </span>
                            <span className="text-xs text-zinc-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {q.timeLimit}s
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <button 
                            onClick={() => editQuestion(q)} 
                            className="p-2 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                            title="Editar"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setDeleteQuestionId(q.id)} 
                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Excluir"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
                ))}
            </AnimatePresence>
            
            {questions.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                    <AlertCircle className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium">Nenhuma pergunta adicionada.</p>
                    <p className="text-sm text-zinc-400">Preencha o formulário acima para começar.</p>
                </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={!!deleteQuestionId} onOpenChange={(open) => !open && setDeleteQuestionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Pergunta?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta pergunta?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteQuestion} className="bg-red-600 hover:bg-red-700">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
