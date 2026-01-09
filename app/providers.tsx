"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { SoundProvider } from "@/contexts/SoundContext";
import { HapticProvider } from "@/contexts/HapticContext";
import { PreferencesProvider } from "@/contexts/PreferencesContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SoundProvider>
        <HapticProvider>
          <PreferencesProvider>
            {children}
          </PreferencesProvider>
        </HapticProvider>
      </SoundProvider>
    </AuthProvider>
  );
}