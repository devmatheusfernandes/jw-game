import { Question } from "@/types";

export interface Stage {
  id: string;
  title: string;
  description: string;
  order: number; // Gap indexing (10, 20, 30...)
  color: string; // Tailwind color class
  slug: string;
}

export interface Deck {
  id: string;
  stageId: string;
  title: string;
  description?: string;
  order: number;
  totalQuestions: number;
  questions?: Question[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string; // Icon name or path
  condition: string; // Description of how to earn it
}

export interface UserProgress {
  uid: string;
  currentStageId: string;
  completedDecks: string[]; // IDs of completed decks
  earnedBadges: string[]; // IDs of earned badges
  deckProgress: Record<string, number>; // deckId -> lastQuestionIndex (for resuming)
  totalScore: number;
  streak: {
      count: number;
      lastLoginDate: string; // ISO Date string YYYY-MM-DD
  };
  consecutiveCorrectAnswers: number;
}
