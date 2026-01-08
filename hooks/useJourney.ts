"use client";

import { useState, useEffect, useCallback } from "react";
import { UserProgress, Stage, Deck, Badge } from "@/types/journey";
import { getUserJourneyProgress, saveDeckProgress, completeDeck, getStages, getJourneyDecks, submitAnswer } from "@/lib/journey";
import { BADGES } from "@/lib/journey-constants";
import { useAuth } from "@/contexts/AuthContext"; // Assuming AuthContext exists
import { toast } from "sonner"; // Assuming sonner is used for toasts

export function useJourney() {
  const { user } = useAuth(); // You might need to adjust this depending on how Auth is implemented
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [stages, setStages] = useState<Stage[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);

  const fetchData = useCallback(async () => {
    if (!user) {
        setLoading(false);
        return;
    }
    try {
      setLoading(true);
      const [progressData, stagesData, decksData] = await Promise.all([
        getUserJourneyProgress(user.uid),
        getStages(),
        getJourneyDecks()
      ]);
      
      setProgress(progressData);
      setStages(stagesData);
      setDecks(decksData);
    } catch (error) {
      console.error("Error fetching journey data:", error);
      toast.error("Erro ao carregar jornada");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveProgress = useCallback(async (deckId: string, questionIndex: number) => {
    if (!user) return;
    
    // Optimistic update
    setProgress(prev => prev ? ({
      ...prev,
      deckProgress: {
        ...prev.deckProgress,
        [deckId]: questionIndex
      }
    }) : null);

    try {
      await saveDeckProgress(user.uid, deckId, questionIndex);
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  }, [user]);

  const submitUserAnswer = useCallback(async (deckId: string, isCorrect: boolean, bonusPoints: number = 0) => {
    if (!user) return;
    try {
        const { newBadges } = await submitAnswer(user.uid, deckId, isCorrect, bonusPoints);
        
        if (newBadges.length > 0) {
            newBadges.forEach(badge => {
                toast.success(`Nova Conquista: ${badge.title}!`, {
                    description: badge.description,
                    icon: "🏆"
                });
            });
        }
        return { newBadges };
    } catch (error) {
        console.error("Error submitting answer:", error);
    }
  }, [user]);

  const finishDeck = useCallback(async (deckId: string) => {
    if (!user) return;
    try {
      const { newBadges, unlockedStage } = await completeDeck(user.uid, deckId);
      
      // Refresh progress to get the source of truth
      // We can just re-fetch progress, no need to fetch stages/decks again mostly
      const progressData = await getUserJourneyProgress(user.uid);
      setProgress(progressData);

      if (newBadges.length > 0) {
        newBadges.forEach(badge => {
            toast.success(`Nova Conquista: ${badge.title}!`, {
                description: badge.description,
                icon: "🏆" // Emoji or component
            });
        });
      }

      if (unlockedStage) {
        toast.success(`Nova Etapa Desbloqueada: ${unlockedStage.title}!`);
      }

      return { newBadges, unlockedStage };
    } catch (error) {
      console.error("Error completing deck:", error);
      toast.error("Erro ao salvar conclusão");
    }
  }, [user]);

  const getStageDecks = (stageId: string) => {
    return decks.filter(d => d.stageId === stageId).sort((a, b) => a.order - b.order);
  };

  const isStageLocked = (stageId: string) => {
    if (!progress || stages.length === 0) return true;
    const stage = stages.find(s => s.id === stageId);
    if (!stage) return true;
    
    // Simple logic: if stage order is higher than current stage order
    const currentStage = stages.find(s => s.id === progress.currentStageId);
    if (!currentStage) return true;

    return stage.order > currentStage.order;
  };

  const isDeckLocked = (deck: Deck) => {
    if (!progress || stages.length === 0) return true;
    if (isStageLocked(deck.stageId)) return true;
    
    const stageDecks = getStageDecks(deck.stageId);
    const prevDeck = stageDecks.find(d => d.order === deck.order - 1); // Assuming orders are 1, 2, 3...
    
    if (!prevDeck) return false; // First deck is always open if stage is open
    return !progress.completedDecks.includes(prevDeck.id);
  };

  return {
    progress,
    loading,
    saveProgress,
    submitUserAnswer,
    finishDeck,
    stages,
    getStageDecks,
    isStageLocked,
    isDeckLocked,
    badges: BADGES
  };
}
