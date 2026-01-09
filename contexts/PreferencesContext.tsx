"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface PreferencesContextType {
  hintsEnabled: boolean;
  toggleHints: () => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [hintsEnabled, setHintsEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const saved = window.localStorage.getItem("jw-game-hints-enabled");
    return saved === null ? true : saved === "true";
  });

  const toggleHints = () => {
    setHintsEnabled((prev) => {
      const newValue = !prev;
      localStorage.setItem("jw-game-hints-enabled", String(newValue));
      return newValue;
    });
  };

  return (
    <PreferencesContext.Provider value={{ hintsEnabled, toggleHints }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
}
