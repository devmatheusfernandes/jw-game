"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface HapticContextType {
  isEnabled: boolean;
  toggleHaptic: () => void;
}

const HapticContext = createContext<HapticContextType | undefined>(undefined);

export function HapticProvider({ children }: { children: ReactNode }) {
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const saved = window.localStorage.getItem("jw-game-haptic");
    return saved !== "false"; // Padrão é ativado
  });

  const toggleHaptic = () => {
    setIsEnabled((prev) => {
      const newValue = !prev;
      localStorage.setItem("jw-game-haptic", String(newValue));
      return newValue;
    });
  };

  return (
    <HapticContext.Provider value={{ isEnabled, toggleHaptic }}>
      {children}
    </HapticContext.Provider>
  );
}

export function useHapticContext() {
  const context = useContext(HapticContext);
  if (context === undefined) {
    throw new Error("useHapticContext must be used within a HapticProvider");
  }
  return context;
}
