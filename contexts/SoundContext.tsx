"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface SoundContextType {
  isMuted: boolean;
  toggleMute: () => void;
  volume: number; // 0.0 a 1.0
  setVolume: (volume: number) => void;
  play: (soundPath: string) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const savedMute = window.localStorage.getItem("jw-game-muted");
    return savedMute === "true";
  });
  const [volume, setVolume] = useState<number>(() => {
    if (typeof window === "undefined") return 0.5;
    const savedVolume = window.localStorage.getItem("jw-game-volume");
    return savedVolume ? parseFloat(savedVolume) : 0.5;
  });

  const toggleMute = () => {
    setIsMuted((prev) => {
      const newValue = !prev;
      localStorage.setItem("jw-game-muted", String(newValue));
      return newValue;
    });
  };

  const updateVolume = (newVolume: number) => {
    const v = Math.max(0, Math.min(1, newVolume));
    setVolume(v);
    localStorage.setItem("jw-game-volume", String(v));
  };

  const play = (soundPath: string) => {
    if (isMuted) return;

    try {
      const audio = new Audio(soundPath);
      audio.volume = volume;
      audio.play().catch((e) => {
        // Ignora erros de autoplay bloqueado ou arquivo não encontrado para não quebrar a UI
        console.warn("Erro ao reproduzir som:", soundPath, e);
      });
    } catch (e) {
      console.error("Erro ao inicializar áudio:", e);
    }
  };

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute, volume, setVolume: updateVolume, play }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSoundContext() {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error("useSoundContext must be used within a SoundProvider");
  }
  return context;
}
