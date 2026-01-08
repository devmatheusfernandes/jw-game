"use client";

import { JourneyGameView } from "@/components/journey/JourneyGameView";
import { getJourneyDecks } from "@/lib/journey"; // We will use this to get decks, ideally we should have getDeckById
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, notFound } from "next/navigation";
import { useEffect, useState, use } from "react";
import { Deck } from "@/types/journey";
import { Question } from "@/types";
import { Loader2 } from "lucide-react";

interface PageProps {
  params: Promise<{
    deckId: string;
  }>;
}

export default function PlayDeckPage({ params }: PageProps) {
  const { deckId } = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && !loading) {
      // Fetch deck data
      const loadDeck = async () => {
        try {
          // Ideally create a specific getJourneyDeckById(deckId) function in lib/journey
          // For now, I'll reuse getJourneyDecks() and filter, or I can query Firestore directly here?
          // Better to add getJourneyDeckById to lib/journey.
          // But let's assume I will add it or use a workaround.
          // I'll assume getJourneyDecks returns all decks and I filter.
          // Optimally: update lib/journey to have getJourneyDeck(id)
          const decks = await getJourneyDecks();
          const foundDeck = decks.find((d) => d.id === deckId);
          setDeck(foundDeck || null);
        } catch (error) {
          console.error("Error loading deck", error);
        } finally {
          setDataLoading(false);
        }
      };
      loadDeck();
    }
  }, [user, loading, deckId]);

  if (loading || dataLoading)
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 rounded-2xl bg-white/50 dark:bg-zinc-900/50 shadow-xl backdrop-blur-md">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  if (!user) return null;

  if (!deck) {
    notFound();
  }

  // Fallback for questions if they are missing in the DB object (e.g. from seed)
  const questions: Question[] = deck.questions || [
    {
      id: "q1",
      text: "Exemplo de pergunta (Placeholder)",
      type: "true_false",
      correctAnswer: true,
      options: ["true", "false"],
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <JourneyGameView
        deckId={deckId}
        title={deck.title}
        questions={questions}
      />
    </div>
  );
}
