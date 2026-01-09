"use client";

import * as React from "react";
import { Settings, Volume2, VolumeX, Smartphone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useSound } from "@/hooks/useSound";
import { useHapticContext } from "@/contexts/HapticContext";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SettingsDropdownProps {
  showSeeAll?: boolean;
}

export function SettingsDropdown({ showSeeAll = false }: SettingsDropdownProps) {
  const { isMuted, toggleMute } = useSound();
  const { isEnabled: isHapticEnabled, toggleHaptic } = useHapticContext();
  const [isOpen, setIsOpen] = React.useState(false);


  // Close dropdown when clicking outside
  React.useEffect(() => {
    if (!isOpen) return;
    const close = () => setIsOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [isOpen]);

  // Prevent click propagation from the button itself to the document
  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  // Prevent click propagation from the dropdown content
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleOpen}
        className={cn(
            "rounded-full w-10 h-10 transition-colors",
            isOpen 
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100" 
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        )}
        title="Configurações"
      >
        <Settings className={cn("w-5 h-5 transition-transform duration-300", isOpen && "rotate-90")} />
        <span className="sr-only">Configurações</span>
      </Button>
      
      {isOpen && (
        <div 
            onClick={handleContentClick}
            className="absolute right-0 top-12 min-w-[240px] rounded-xl border border-zinc-200 bg-white p-3 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 z-50 animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-1"
        >
            <div className="px-2 py-1.5 mb-1">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Configurações</h3>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-full", !isMuted ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400")}>
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Sons</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">Efeitos sonoros</span>
                    </div>
                </div>
                <Switch 
                    checked={!isMuted} 
                    onCheckedChange={toggleMute}
                />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-full", isHapticEnabled ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400")}>
                        <Smartphone className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Vibração</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">Feedback tátil</span>
                    </div>
                </div>
                <Switch 
                    checked={isHapticEnabled} 
                    onCheckedChange={toggleHaptic}
                />
            </div>

            {showSeeAll && (
              <div className="pt-2 mt-2 border-t border-zinc-100 dark:border-zinc-800">
                <Link
                  href="/dashboard/settings"
                  className="flex items-center justify-between w-full p-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-lg transition-colors group"
                >
                  <span>Ver todas configurações</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
