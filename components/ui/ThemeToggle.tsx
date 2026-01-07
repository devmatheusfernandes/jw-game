"use client";

import * as React from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
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

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleOpen}
        className="rounded-full w-10 h-10 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        title="Alternar tema"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Alternar tema</span>
      </Button>
      
      {isOpen && (
        <div className="absolute right-0 top-12 min-w-[140px] rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-950 z-50 animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-0.5">
          <button
            onClick={() => setTheme("light")}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 ${
              theme === 'light' 
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30' 
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <Sun className="h-4 w-4" />
            <span className="font-medium">Claro</span>
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 ${
              theme === 'dark' 
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30' 
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <Moon className="h-4 w-4" />
            <span className="font-medium">Escuro</span>
          </button>
          <button
            onClick={() => setTheme("system")}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 ${
              theme === 'system' 
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30' 
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <Laptop className="h-4 w-4" />
            <span className="font-medium">Sistema</span>
          </button>
        </div>
      )}
    </div>
  );
}
