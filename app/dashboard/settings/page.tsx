"use client";

import { useSoundContext } from "@/contexts/SoundContext";
import { useHapticContext } from "@/contexts/HapticContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Volume2, VolumeX, Smartphone, SmartphoneNfc, ArrowLeft, Lightbulb, LightbulbOff } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import Link from "next/link";

export default function SettingsPage() {
  const { isMuted, toggleMute } = useSoundContext();
  const { isEnabled: isHapticEnabled, toggleHaptic } = useHapticContext();
  const { hintsEnabled, toggleHints } = usePreferences();

  return (
    <div className="container max-w-2xl mx-auto p-4 py-8">
       {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-sm mb-8">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Link href="/dashboard" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                </Link>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white hidden sm:block">
                    Configurações
                </h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
        </div>
      </header>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-8"
      >

        <div className="grid gap-6">
          {/* Seção de Áudio */}
          <div className="bg-card rounded-xl border p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-4 border-b pb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                {isMuted ? (
                  <VolumeX className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                ) : (
                  <Volume2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">Áudio e Sons</h2>
                <p className="text-sm text-muted-foreground">
                  Gerencie os efeitos sonoros do jogo
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sound-toggle" className="text-base">
                  Efeitos Sonoros
                </Label>
                <p className="text-sm text-muted-foreground">
                  Tocar sons ao acertar, errar ou completar desafios
                </p>
              </div>
              <Switch
                id="sound-toggle"
                checked={!isMuted}
                onCheckedChange={toggleMute}
              />
            </div>
          </div>

          {/* Seção de Feedback Háptico */}
          <div className="bg-card rounded-xl border p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-4 border-b pb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                {isHapticEnabled ? (
                  <SmartphoneNfc className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                ) : (
                  <Smartphone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">Vibração</h2>
                <p className="text-sm text-muted-foreground">
                  Feedback tátil em dispositivos móveis
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="haptic-toggle" className="text-base">
                  Feedback Háptico
                </Label>
                <p className="text-sm text-muted-foreground">
                  Vibrar ao interagir com o jogo (apenas mobile)
                </p>
              </div>
              <Switch
                id="haptic-toggle"
                checked={isHapticEnabled}
                onCheckedChange={toggleHaptic}
              />
            </div>
          </div>

          {/* Seção de Dicas */}
          <div className="bg-card rounded-xl border p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-4 border-b pb-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                {hintsEnabled ? (
                  <Lightbulb className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                ) : (
                  <LightbulbOff className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">Dicas</h2>
                <p className="text-sm text-muted-foreground">
                  Gerencie a exibição de dicas no jogo
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="hints-toggle" className="text-base">
                  Habilitar Dicas
                </Label>
                <p className="text-sm text-muted-foreground">
                  Mostrar dicas opcionais durante o jogo (custam pontos)
                </p>
              </div>
              <Switch
                id="hints-toggle"
                checked={hintsEnabled}
                onCheckedChange={toggleHints}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
