"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import type { UniversalDeck, UniversalQuestion } from "@/types/collections"
import { useUniversalDecks } from "@/hooks/useUniversalDecks"
import { useUniversalQuestions } from "@/hooks/useUniversalQuestions"
import { useTopics } from "@/hooks/useTopics"
import { useAuthStatus } from "@/hooks/useAuthStatus"
import { nonEmpty, uniqueTopicName, validateDeck, validateQuestion } from "@/utils/validation"
import { useRouter } from "next/navigation"
import { getAuth, signOut } from "firebase/auth"

export default function AdminPage() {
  const { enabled: firebaseReady, decks, createDeck } = useUniversalDecks()
  const { questions, loading: loadingQuestions, createQuestion } = useUniversalQuestions()
  const { topics, loading: loadingTopics, create: createTopic } = useTopics()

  const { userId, userName, isAdmin } = useAuthStatus()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const auth = getAuth()
      await signOut(auth)
      toast.success("Logout realizado com sucesso")
      router.push("/")
    } catch (error) {
      toast.error("Erro ao fazer logout")
    }
  }

  const [activeTab, setActiveTab] = useState<"topic" | "deck" | "question">("topic")

  const [deckTitle, setDeckTitle] = useState("")
  const [deckTopicId, setDeckTopicId] = useState("")
  const [deckLevel, setDeckLevel] = useState<UniversalDeck["level"]>("easy")
  const [deckSelectedQuestions, setDeckSelectedQuestions] = useState<string[]>([])

  const [questionTopicId, setQuestionTopicId] = useState("")
  const [questionTitle, setQuestionTitle] = useState("")
  const [questionOptions, setQuestionOptions] = useState<string[]>(["", "", "", ""]) 
  const [answerIndex, setAnswerIndex] = useState<string>("0")
  const [questionLevel, setQuestionLevel] = useState<UniversalQuestion["level"]>("easy")
  const [bibleReference, setBibleReference] = useState<string>("")
  const [source, setSource] = useState<string>("")
  const [image, setImage] = useState<string>("")

  function setOptionValue(idx: number, value: string) {
    setQuestionOptions((prev) => prev.map((v, i) => (i === idx ? value : v)))
  }

  function addOptionField() {
    setQuestionOptions((prev) => [...prev, ""])
  }

  async function handleCreateDeck() {
    const title = deckTitle.trim()
    const topicId = deckTopicId.trim()
    const level = deckLevel
    if (!validateDeck(title, topicId, deckSelectedQuestions)) {
      toast.warning("Preencha título e tópico")
      return
    }
    try {
      const created = await createDeck({ title, topicId, level, questions: deckSelectedQuestions })
      if (created) {
        setDeckTitle("")
        setDeckTopicId("")
        setDeckLevel("easy")
        setDeckSelectedQuestions([])
        toast.success("Deck criado")
      }
    } catch {
      toast.error("Erro ao criar deck")
    }
  }

  async function handleCreateQuestion() {
    const title = questionTitle.trim()
    const cleanedOptions = questionOptions.map((o) => o.trim()).filter((o) => o.length > 0)
    const ansIndexNum = Number(answerIndex)
    if (topics.length === 0) {
      toast.warning("Crie um tópico antes de criar perguntas")
      return
    }
    if (!validateQuestion(title, questionOptions, ansIndexNum)) {
      toast.warning("Resposta correta inválida")
      return
    }
    const options: UniversalQuestion["options"] = cleanedOptions.map((opt, i) => ({ id: crypto.randomUUID(), option: opt, isCorrect: i === ansIndexNum }))
    const payload: Omit<UniversalQuestion, "id" | "createdAt" | "updatedAt"> = {
      topicId: questionTopicId,
      level: questionLevel,
      bibleReference: bibleReference || null,
      source: source || null,
      image: image || null,
      questionType: "multiple_choice",
      questionTitle: title,
      options,
    }
    try {
      const created = await createQuestion(payload)
      if (created) {
        setQuestionTitle("")
        setQuestionOptions(["", "", "", ""]) 
        setAnswerIndex("0")
        setBibleReference("")
        setSource("")
        setImage("")
        toast.success("Pergunta criada")
      }
    } catch {
      toast.error("Erro ao criar pergunta")
    }
  }

  const [topicName, setTopicName] = useState("")
  async function handleCreateTopic() {
    const name = topicName.trim()
    if (!nonEmpty(name)) {
      toast.warning("Informe o nome do tópico")
      return
    }
    if (!uniqueTopicName(name, topics)) {
      toast.warning("Já existe um tópico com esse nome")
      return
    }
    try {
      const t = await createTopic(name)
      if (t) {
        setTopicName("")
        toast.success("Tópico criado")
      }
    } catch {
      toast.error("Erro ao criar tópico")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Toaster position="top-right" richColors />
      
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="mx-auto max-w-screen-xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">Painel Admin</h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">Gerenciar conteúdo do jogo</p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`px-2 py-1 rounded-full text-xs md:text-sm ${isAdmin ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                {isAdmin ? "Admin" : "Usuário"}
              </div>
              {userId && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                  className="h-8"
                >
                  Sair
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-xl px-4 py-6 space-y-6">
        {!userId && (
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
            <CardHeader>
              <CardTitle className="text-red-900 dark:text-red-200 text-lg">🔒 Acesso Restrito</CardTitle>
              <CardDescription className="text-red-800 dark:text-red-300">
                Você precisa estar logado para acessar esta página.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                onClick={() => router.push("/")}
                className="w-full"
              >
                Voltar para página inicial
              </Button>
            </CardFooter>
          </Card>
        )}

        {userId && isAdmin === false && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
            <CardHeader>
              <CardTitle className="text-amber-900 dark:text-amber-200 text-lg">⚠️ Acesso Negado</CardTitle>
              <CardDescription className="text-amber-800 dark:text-amber-300">
                Você não tem permissões de administrador para acessar esta página.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                onClick={() => router.push("/")}
                className="w-full"
              >
                Voltar para página inicial
              </Button>
            </CardFooter>
          </Card>
        )}

        {userId && isAdmin === true && (
          <>
        {!firebaseReady && (
          <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50">
            <AlertTitle className="text-amber-900 dark:text-amber-200">Firebase não configurado</AlertTitle>
            <AlertDescription className="text-amber-800 dark:text-amber-300">
              Configure as variáveis `NEXT_PUBLIC_FIREBASE_*` para habilitar o salvamento.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2 border-b">
          <Button
            variant={activeTab === "topic" ? "default" : "ghost"}
            onClick={() => setActiveTab("topic")}
            className="whitespace-nowrap"
          >
            📚 Tópicos
          </Button>
          <Button
            variant={activeTab === "deck" ? "default" : "ghost"}
            onClick={() => setActiveTab("deck")}
            className="whitespace-nowrap"
          >
            🎴 Decks
          </Button>
          <Button
            variant={activeTab === "question" ? "default" : "ghost"}
            onClick={() => setActiveTab("question")}
            className="whitespace-nowrap"
          >
            ❓ Perguntas
          </Button>
        </div>

        {activeTab === "topic" && (
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Criar Tópico</CardTitle>
                <CardDescription>Organiza perguntas por tema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input 
                  placeholder="Nome do tópico" 
                  value={topicName} 
                  onChange={(e) => setTopicName(e.target.value)} 
                  disabled={!firebaseReady}
                  className="text-base"
                />
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="text-sm font-medium mb-3 flex items-center justify-between">
                    <span>Tópicos existentes</span>
                    <span className="text-xs text-muted-foreground">{topics.length} itens</span>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-auto">
                    {loadingTopics && <div className="text-muted-foreground text-sm py-4 text-center">Carregando...</div>}
                    {!loadingTopics && topics.map((t) => (
                      <div key={t.id} className="bg-background rounded-md px-3 py-2 text-sm border">
                        {t.name}
                      </div>
                    ))}
                    {!loadingTopics && topics.length === 0 && (
                      <div className="text-muted-foreground text-sm py-8 text-center">
                        Nenhum tópico criado ainda
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Button 
                  onClick={handleCreateTopic} 
                  disabled={!firebaseReady} 
                  className="w-full h-11 text-base"
                >
                  Criar tópico
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {activeTab === "deck" && (
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Criar Deck Universal</CardTitle>
                <CardDescription>Decks públicos usados em jogos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Título do deck"
                  value={deckTitle}
                  onChange={(e) => setDeckTitle(e.target.value)}
                  disabled={!firebaseReady}
                  className="text-base"
                />
                <Select value={deckTopicId} onValueChange={setDeckTopicId}>
                  <SelectTrigger className="w-full h-11" disabled={!firebaseReady || loadingTopics}>
                    <SelectValue placeholder={loadingTopics ? "Carregando..." : "Selecione o tópico"} />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={deckLevel} onValueChange={(v) => setDeckLevel(v as UniversalDeck["level"]) }>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Nível de dificuldade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">🟢 Fácil</SelectItem>
                    <SelectItem value="medium">🟡 Média</SelectItem>
                    <SelectItem value="hard">🟠 Difícil</SelectItem>
                    <SelectItem value="very_hard">🔴 Muito difícil</SelectItem>
                  </SelectContent>
                </Select>
                <div className="border rounded-lg bg-muted/30 p-4">
                  <div className="text-sm font-medium mb-3 flex items-center justify-between">
                    <span>Perguntas selecionadas</span>
                    <span className="text-xs text-muted-foreground">{deckSelectedQuestions.length} de {questions.length}</span>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-auto">
                    {loadingQuestions && <div className="text-muted-foreground text-sm py-4 text-center">Carregando...</div>}
                    {!loadingQuestions && questions.map((q) => (
                      <label key={q.id} className="flex items-start gap-3 p-3 rounded-md hover:bg-background/80 cursor-pointer border bg-background transition-colors">
                        <input
                          type="checkbox"
                          className="mt-1 size-4 shrink-0"
                          checked={deckSelectedQuestions.includes(q.id)}
                          onChange={(e) => {
                            const checked = e.target.checked
                            setDeckSelectedQuestions((prev) => {
                              if (checked) return [...prev, q.id]
                              return prev.filter((id) => id !== q.id)
                            })
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium line-clamp-2">{q.questionTitle}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Nível: {q.level}
                          </div>
                        </div>
                      </label>
                    ))}
                    {!loadingQuestions && questions.length === 0 && (
                      <div className="text-muted-foreground text-sm py-8 text-center">
                        Nenhuma pergunta disponível
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Button 
                  onClick={handleCreateDeck} 
                  disabled={!firebaseReady || questions.length === 0} 
                  className="w-full h-11 text-base"
                >
                  Criar deck
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Decks Universais</CardTitle>
                <CardDescription>Lista dos decks existentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {decks.map((d) => (
                    <div key={d.id} className="rounded-lg border p-4 bg-gradient-to-br from-background to-muted/30">
                      <div className="font-semibold text-base">{d.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">Tópico: {d.topicId}</div>
                      <div className="flex items-center gap-4 mt-3 text-xs">
                        <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {d.level}
                        </span>
                        <span className="text-muted-foreground">
                          {d.questions?.length ?? 0} perguntas
                        </span>
                      </div>
                    </div>
                  ))}
                  {decks.length === 0 && (
                    <div className="text-muted-foreground py-12 text-center">
                      Nenhum deck encontrado
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "question" && (
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Criar Pergunta Universal</CardTitle>
                <CardDescription>Pergunta ligada a um deck universal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={questionTopicId} onValueChange={setQuestionTopicId}>
                  <SelectTrigger className="w-full h-11" disabled={!firebaseReady || loadingTopics}>
                    <SelectValue placeholder={loadingTopics ? "Carregando..." : "Selecione o tópico"} />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Enunciado da pergunta"
                  value={questionTitle}
                  onChange={(e) => setQuestionTitle(e.target.value)}
                  disabled={!firebaseReady}
                  className="text-base"
                />

                <div className="space-y-3">
                  <div className="text-sm font-medium">Informações adicionais (opcional)</div>
                  <Input 
                    placeholder="Referência bíblica" 
                    value={bibleReference} 
                    onChange={(e) => setBibleReference(e.target.value)} 
                    disabled={!firebaseReady}
                    className="text-base"
                  />
                  <Input 
                    placeholder="Fonte" 
                    value={source} 
                    onChange={(e) => setSource(e.target.value)} 
                    disabled={!firebaseReady}
                    className="text-base"
                  />
                  <Input 
                    placeholder="Imagem (URL)" 
                    value={image} 
                    onChange={(e) => setImage(e.target.value)} 
                    disabled={!firebaseReady}
                    className="text-base"
                  />
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-medium">Opções de resposta</div>
                  {questionOptions.map((opt, i) => (
                    <Input
                      key={i}
                      placeholder={`Opção ${i + 1}`}
                      value={opt}
                      onChange={(e) => setOptionValue(i, e.target.value)}
                      disabled={!firebaseReady}
                      className="text-base"
                    />
                  ))}
                  <Button 
                    variant="outline" 
                    onClick={addOptionField} 
                    disabled={!firebaseReady}
                    className="w-full h-11"
                  >
                    + Adicionar opção
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Select value={answerIndex} onValueChange={setAnswerIndex}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Resposta correta" />
                    </SelectTrigger>
                    <SelectContent>
                      {questionOptions.map((_, i) => (
                        <SelectItem key={i} value={String(i)}>
                          Opção {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={questionLevel} onValueChange={(v) => setQuestionLevel(v as UniversalQuestion["level"])}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Dificuldade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">🟢 Fácil</SelectItem>
                      <SelectItem value="medium">🟡 Média</SelectItem>
                      <SelectItem value="hard">🟠 Difícil</SelectItem>
                      <SelectItem value="very_hard">🔴 Muito difícil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Button 
                  onClick={handleCreateQuestion} 
                  disabled={!firebaseReady || topics.length === 0} 
                  className="w-full h-11 text-base"
                >
                  Criar pergunta
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
          </>
        )}
      </main>
    </div>
  )
}