"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { LogIn, User } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-screen-sm px-4 py-12 space-y-6">
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
          <p className="text-muted-foreground">Escolha como deseja continuar.</p>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Opções de autenticação</CardTitle>
            <CardDescription>Use Google para recursos pessoais ou continue como convidado.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-3">
              <Button className="h-10 px-6">
                <LogIn className="size-4" />
                Entrar com Google
              </Button>
              <Button variant="outline" className="h-10 px-6">
                <User className="size-4" />
                Continuar como convidado
              </Button>
            </div>
            <div className="mt-6">
              <Link href="/" className="text-sm text-primary underline-offset-4 hover:underline">Voltar para início</Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

