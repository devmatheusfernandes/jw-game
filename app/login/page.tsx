"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Chrome } from "lucide-react";

export default function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Bem-vindo</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Faça login para criar e gerenciar seus decks</p>
        </div>

        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md font-medium"
        >
          <Chrome className="w-5 h-5 text-indigo-600" />
          Continuar com Google
        </button>

        <p className="text-sm text-zinc-500">
          Ao continuar, você concorda com nossos termos de serviço e política de privacidade.
        </p>
      </div>
    </div>
  );
}