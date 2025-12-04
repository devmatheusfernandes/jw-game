import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, BookOpen, Users, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-screen-xl px-4 py-12 space-y-6">
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight">Bible Game Quiz</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Responda perguntas bíblicas, jogue sozinho ou com amigos em tempo real.
            Acesse decks oficiais ou crie seus próprios decks e perguntas.
          </p>
          <div className="flex gap-3">
            <Button className="h-10 px-6">Começar a jogar</Button>
            <Button asChild variant="outline" className="h-10 px-6">
              <a href="/login">Entrar com Google</a>
            </Button>
          </div>
        </section>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><Trophy className="size-5" /> Quizzes</CardTitle>
              <CardDescription>Jogue e acompanhe sua pontuação.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">Modo estudo e partidas rápidas.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><BookOpen className="size-5" /> Decks Universais</CardTitle>
              <CardDescription>Conteúdo oficial moderado por admins.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">Escolha por temas e níveis.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><ShieldCheck className="size-5" /> Decks Pessoais</CardTitle>
              <CardDescription>Crie e gerencie seus próprios decks.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">Edite perguntas e organize tópicos.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><Users className="size-5" /> Multiplayer</CardTitle>
              <CardDescription>Partidas em tempo real com amigos.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground">Crie uma sessão e compartilhe o código.</p>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Como funciona</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="pt-0">
                <p className="text-lg">1. Entre com Google</p>
                <p className="text-sm text-muted-foreground">Autenticação simples e segura.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-0">
                <p className="text-lg">2. Escolha um deck</p>
                <p className="text-sm text-muted-foreground">Universal ou pessoal, por tema e nível.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-0">
                <p className="text-lg">3. Jogue e compartilhe</p>
                <p className="text-sm text-muted-foreground">Acompanhe a pontuação em tempo real.</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
