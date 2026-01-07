"use client";

import { useSound } from "@/hooks/useSound";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SoundToggle() {
  const { isMuted, toggleMute } = useSound();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleMute}
      className="rounded-full w-10 h-10 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
      title={isMuted ? "Ativar som" : "Desativar som"}
    >
      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
    </Button>
  );
}
