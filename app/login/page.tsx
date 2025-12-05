"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { LogIn, ArrowLeft, Shield, Users, Trophy } from "lucide-react"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { auth, db } from "@/lib/firebase"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { useRouter } from "next/navigation"
import { doc, getDoc, setDoc } from "firebase/firestore"

export default function LoginPage() {
  const router = useRouter()
  const ready = !!auth

  async function handleGoogle() {
    if (!auth) {
      toast.warning("Firebase não está configurado")
      return
    }
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      if (!db || !auth.currentUser) {
        toast.warning("Banco de dados não configurado")
      } else {
        const uid = auth.currentUser.uid
        const ref = doc(db, "users", uid)
        const snap = await getDoc(ref)
        if (!snap.exists()) {
          await setDoc(ref, { id: uid, IsAdmin: false })
        }
      }
      toast.success("Login realizado")
      router.push("/admin")
    } catch {
      toast.error("Falha no login")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Toaster position="top-right" richColors />
      
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-screen-xl px-4 py-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Voltar para início
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-screen-sm px-4 py-12 md:py-20">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <LogIn className="size-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Bem-vindo de volta
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto">
              Entre para acessar recursos exclusivos e salvar seu progresso
            </p>
          </div>

          <Card className="shadow-lg border-2">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl">Faça login</CardTitle>
              <CardDescription className="text-base">
                Use sua conta Google para uma experiência completa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button 
                className="w-full h-12 text-base font-medium" 
                onClick={handleGoogle} 
                disabled={!ready}
                size="lg"
              >
                <svg className="size-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuar com Google
              </Button>


              {!ready && (
                <div className="text-center text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  ⚠️ Firebase não configurado. Configure as variáveis de ambiente.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}