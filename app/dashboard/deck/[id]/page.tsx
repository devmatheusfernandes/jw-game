"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Deck, getDeckById, saveDeck } from "@/lib/decks";
import { Question } from "@/types";
import { generateUUID } from "@/lib/utils";
import { ArrowLeft, Plus, Save, Trash2, Clock, CheckCircle, X, Edit } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function DeckEditor() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const deckId = params.id as string;
  const isNew = deckId === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  // Deck State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);

  // Question Editor State
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [qText, setQText] = useState("");
  const [qType, setQType] = useState<"multiple_choice" | "true_false">("multiple_choice");
  const [qOptions, setQOptions] = useState(["", "", "", ""]);
  const [qCorrect, setQCorrect] = useState(""); // For multiple choice: value string. For true/false: "true" or "false" string
  const [qTime, setQTime] = useState(30);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (!isNew && user) {
      loadDeck();
    }
  }, [deckId, isNew, user, authLoading]);

  async function loadDeck() {
    try {
      const deck = await getDeckById(deckId);
      if (deck) {
        if (deck.ownerId !== "global" && deck.ownerId !== user?.uid) {
          alert("Você não tem permissão para editar este deck");
          router.push("/dashboard");
          return;
        }
        setTitle(deck.title);
        setDescription(deck.description);
        setQuestions(deck.questions);
      } else {
        alert("Deck não encontrado");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function handleSaveQuestion() {
    if (!qText) return alert("Digite a pergunta");
    if (qType === "multiple_choice") {
      if (qOptions.some(o => !o.trim())) return alert("Preencha todas as opções");
      if (!qCorrect) return alert("Selecione a resposta correta");
    }

    const newQuestion: Question = {
      id: editingQuestionId || generateUUID(),
      text: qText,
      type: qType,
      correctAnswer: qType === "multiple_choice" ? qCorrect : (qCorrect === "true"),
      timeLimit: qTime,
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
  }

  function deleteQuestion(id: string) {
    if (confirm("Remover pergunta?")) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  }

  function resetQuestionForm() {
    setEditingQuestionId(null);
    setQText("");
    setQType("multiple_choice");
    setQOptions(["", "", "", ""]);
    setQCorrect("");
    setQTime(30);
  }

  async function handleSaveDeck() {
    if (!title) return alert("Digite um título");
    if (questions.length === 0) return alert("Adicione pelo menos uma pergunta");
    if (!user) return;

    setSaving(true);
    try {
      await saveDeck({
        title,
        description,
        questions,
        ownerId: user.uid,
        isGlobal: false
      }, isNew ? undefined : deckId);
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar deck");
    } finally {
      setSaving(false);
    }
  }

  if (loading || authLoading) return <div className="p-8 text-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 pb-24">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 bg-zinc-50 dark:bg-zinc-950 z-10 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              {isNew ? "Novo Deck" : "Editar Deck"}
            </h1>
          </div>
          <button
            onClick={handleSaveDeck}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {saving ? "Salvando..." : (
              <>
                <Save className="w-4 h-4" /> Salvar Deck
              </>
            )}
          </button>
        </div>

        {/* Deck Details */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Título</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Ex: Curiosidades Bíblicas"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Descrição</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Uma breve descrição do seu deck..."
              rows={2}
            />
          </div>
        </div>

        {/* Question Form */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm space-y-6 border-2 border-indigo-100 dark:border-indigo-900/20">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              {editingQuestionId ? "Editar Pergunta" : "Nova Pergunta"}
            </h2>
            {editingQuestionId && (
              <button onClick={resetQuestionForm} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300">
                Cancelar Edição
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Pergunta</label>
              <input
                type="text"
                value={qText}
                onChange={e => setQText(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Qual é a pergunta?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Tipo</label>
                <select
                  value={qType}
                  onChange={e => setQType(e.target.value as any)}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="multiple_choice">Múltipla Escolha</option>
                  <option value="true_false">Verdadeiro ou Falso</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Tempo (segundos)</label>
                <input
                  type="number"
                  value={qTime}
                  onChange={e => setQTime(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {qType === "multiple_choice" ? (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Opções (marque a correta)</label>
                {qOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="correct-answer"
                      checked={qCorrect === opt && opt !== ""}
                      onChange={() => setQCorrect(opt)}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={e => {
                        const newOptions = [...qOptions];
                        newOptions[idx] = e.target.value;
                        setQOptions(newOptions);
                        if (qCorrect === opt) setQCorrect(e.target.value);
                      }}
                      className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                      placeholder={`Opção ${idx + 1}`}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Resposta Correta</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tf-correct"
                      checked={qCorrect === "true"}
                      onChange={() => setQCorrect("true")}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-zinc-900 dark:text-white">Verdadeiro</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tf-correct"
                      checked={qCorrect === "false"}
                      onChange={() => setQCorrect("false")}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-zinc-900 dark:text-white">Falso</span>
                  </label>
                </div>
              </div>
            )}

            <button
              onClick={handleSaveQuestion}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex justify-center items-center gap-2"
            >
              {editingQuestionId ? "Atualizar Pergunta" : "Adicionar Pergunta"}
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            Perguntas <span className="text-sm font-normal text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full">{questions.length}</span>
          </h2>
          
          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white dark:bg-zinc-900 rounded-lg p-4 shadow-sm border border-zinc-200 dark:border-zinc-800 flex items-start justify-between group">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-xs font-medium text-zinc-500">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white">{q.text}</p>
                    <div className="flex gap-2 mt-1 text-xs text-zinc-500">
                      <span className="uppercase">{q.type === 'multiple_choice' ? 'Múltipla Escolha' : 'V/F'}</span>
                      <span>•</span>
                      <span>{q.timeLimit}s</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => editQuestion(q)} className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteQuestion(q.id)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {questions.length === 0 && (
              <p className="text-center text-zinc-500 py-8 italic">Nenhuma pergunta adicionada ainda.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}