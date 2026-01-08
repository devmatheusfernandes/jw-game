"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Flame, Zap, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ComboIndicatorProps {
  count: number;
  className?: string;
  mode?: "floating" | "inline";
}

export function ComboIndicator({ count, className, mode = "floating" }: ComboIndicatorProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (count >= 2) {
      setShow(true);
      if (mode === "floating") {
        const timer = setTimeout(() => setShow(false), 2000);
        return () => clearTimeout(timer);
      }
    } else {
      setShow(false);
    }
  }, [count, mode]);

  // Configuração visual baseada no nível do combo
  const getComboConfig = (c: number) => {
    const isInline = mode === "inline";
    if (c >= 10)
      return {
        color: "text-purple-500",
        bg: "bg-purple-100 dark:bg-purple-900/30",
        border: "border-purple-500",
        icon: <Trophy className={cn("fill-current", isInline ? "w-4 h-4" : "w-6 h-6")} />,
        text: "LENDÁRIO!",
        scale: isInline ? 1.1 : 1.5,
      };
    if (c >= 5)
      return {
        color: "text-red-500",
        bg: "bg-red-100 dark:bg-red-900/30",
        border: "border-red-500",
        icon: <Flame className={cn("fill-current", isInline ? "w-4 h-4" : "w-6 h-6")} />,
        text: "SUPER!",
        scale: isInline ? 1.1 : 1.3,
      };
    return {
      color: "text-orange-500",
      bg: "bg-orange-100 dark:bg-orange-900/30",
      border: "border-orange-500",
      icon: <Zap className={cn("fill-current", isInline ? "w-4 h-4" : "w-6 h-6")} />,
      text: "COMBO!",
      scale: isInline ? 1.05 : 1.1,
    };
  };

  const config = getComboConfig(count);

  if (count < 2) return null;

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key={count}
          initial={mode === "floating" ? { scale: 0.5, opacity: 0, y: 20, rotate: -10 } : { scale: 0.8, opacity: 0 }}
          animate={mode === "floating" ? { scale: config.scale, opacity: 1, y: 0, rotate: 0 } : { scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
          className={cn(
            mode === "floating" 
              ? "fixed top-24 right-4 z-40 pointer-events-none flex flex-col items-center" 
              : "flex items-center gap-2 pointer-events-none mr-2",
            className
          )}
        >
          <div
            className={cn(
              "flex items-center gap-2 rounded-full border-2 shadow-sm backdrop-blur-sm transition-colors duration-300",
              mode === "inline" ? "px-3 py-1 text-sm border-2" : "px-4 py-2 border-4 shadow-xl",
              config.bg,
              config.border,
              config.color
            )}
          >
            {config.icon}
            <span className={cn("font-black tracking-tighter", mode === "inline" ? "text-lg" : "text-2xl")}>
              {count}x
            </span>
          </div>
          
          {mode === "floating" && (
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "mt-1 font-bold text-sm uppercase tracking-widest drop-shadow-md",
                config.color
              )}
            >
              {config.text}
            </motion.span>
          )}

          {/* Efeito de partículas (simplificado com divs) */}
          {count >= 5 && (
            <>
              <motion.div
                className={cn("absolute -z-10 w-full h-full rounded-full opacity-50 blur-xl", config.bg)}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
