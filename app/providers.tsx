"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { SoundProvider } from "@/contexts/SoundContext";
import { HapticProvider } from "@/contexts/HapticContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SoundProvider>
        <HapticProvider>
          {children}
        </HapticProvider>
      </SoundProvider>
    </AuthProvider>
  );
}