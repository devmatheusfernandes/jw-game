import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, BookOpen, Users, ShieldCheck, Sparkles, Play, LogIn, Settings } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="mx-auto max-w-screen-xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="size-5 text-primary" />
              </div>
              <span className="font-bold text-lg">Bible Quiz</span>
            </div>
            <nav className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin">
                  <Settings className="size-4 mr-2" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">
                  <LogIn className="size-4 mr-2" />
                  Entrar
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-xl px-4 py-12 md:py-20 space-y-16">
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="size-4" />
            Aprenda enquanto se diverte
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Quiz Bíblico
            <span className="block text-primary mt-2">Interativo e Divertido</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Responda perguntas bíblicas, jogue sozinho ou com amigos em tempo real.
            Acesse decks oficiais ou crie seus próprios desafios personalizados.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="h-12 px-8 text-base font-semibold">
              <Play className="size-5 mr-2" />
              Começar a jogar
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8 text-base" asChild>
              <Link href="/login">
                <LogIn className="size-5 mr-2" />
                Entrar com Google
              </Link>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Gratuito</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>Multiplayer</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span>Personalizável</span>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold">Recursos Principais</h2>
            <p className="text-muted-foreground">Tudo que você precisa para estudar e se divertir</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-bl-[100%]"></div>
              <CardHeader className="relative">
                <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Trophy className="size-6 text-yellow-600 dark:text-yellow-500" />
                </div>
                <CardTitle className="text-xl">Quizzes Interativos</CardTitle>
                <CardDescription className="text-base">
                  Jogue e acompanhe sua pontuação em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-sm text-muted-foreground">
                  Modo estudo, partidas rápidas e desafios progressivos para todos os níveis.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-[100%]"></div>
              <CardHeader className="relative">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <BookOpen className="size-6 text-blue-600 dark:text-blue-500" />
                </div>
                <CardTitle className="text-xl">Decks Universais</CardTitle>
                <CardDescription className="text-base">
                  Conteúdo oficial moderado e verificado
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-sm text-muted-foreground">
                  Escolha entre diversos temas, níveis de dificuldade e categorias bíblicas.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-bl-[100%]"></div>
              <CardHeader className="relative">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="size-6 text-green-600 dark:text-green-500" />
                </div>
                <CardTitle className="text-xl">Decks Pessoais</CardTitle>
                <CardDescription className="text-base">
                  Crie e personalize seus próprios decks
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-sm text-muted-foreground">
                  Edite perguntas, organize por tópicos e compartilhe com sua comunidade.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-[100%]"></div>
              <CardHeader className="relative">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Users className="size-6 text-purple-600 dark:text-purple-500" />
                </div>
                <CardTitle className="text-xl">Multiplayer</CardTitle>
                <CardDescription className="text-base">
                  Partidas em tempo real com amigos
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-sm text-muted-foreground">
                  Crie uma sessão, compartilhe o código e desafie seus amigos agora mesmo.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 p-8 md:p-12 text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold">Pronto para começar?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Junte-se a milhares de jogadores que estão aprendendo e se divertindo com a Bíblia de forma interativa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="h-12 px-8 text-base font-semibold">
              <Play className="size-5 mr-2" />
              Jogar agora
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8 text-base bg-background">
              Explorar decks
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t mt-20 py-8 bg-muted/30">
        <div className="mx-auto max-w-screen-xl px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="size-4 text-primary" />
              </div>
              <span className="font-semibold">Bible Quiz</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/about" className="hover:text-foreground transition-colors">Sobre</Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacidade</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Termos</Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">Contato</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Bible Quiz. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}