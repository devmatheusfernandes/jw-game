// =========================
//  AUTH / USER
// =========================

export type AppUser = {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  provider: "google";
  createdAt: number;
};

// =========================
//  UNIVERSAL COLLECTIONS (somente admin escreve)
// =========================

export type Topic = {
  id: string;
  name: string;
};

export type UniversalQuestion = {
  id: string;
  topicId: string;
  level: "easy" | "medium" | "hard" | "very_hard";
  bibleReference?: string | null;
  source?: string | null;
  image?: string | null;
  questionType: "multiple_choice"; // extensível
  questionTitle: string;
  options: Array<{
    id: string;
    option: string;
    isCorrect: boolean;
  }>;
  createdAt: number;
  updatedAt: number;
};

export type UniversalDeck = {
  id: string;
  title: string;
  topicId: string;
  level: "easy" | "medium" | "hard" | "very_hard";
  questions: string[]; // lista de questionId universais
  createdAt: number;
  updatedAt: number;
};

// =========================
//  USER COLLECTIONS (cada user cria seus próprios decks & perguntas)
// =========================

export type UserQuestion = {
  id: string;
  userId: string;
  topicId: string;
  level: "easy" | "medium" | "hard" | "very_hard";
  bibleReference?: string | null;
  source?: string | null;
  image?: string | null;
  questionType: "multiple_choice";
  questionTitle: string;
  options: Array<{
    id: string;
    option: string;
    isCorrect: boolean;
  }>;
  createdAt: number;
  updatedAt: number;
};

export type UserDeck = {
  id: string;
  userId: string;
  title: string;
  topicId: string;
  level: "easy" | "medium" | "hard" | "very_hard";
  questions: string[]; // IDs de userQuestions
  createdAt: number;
  updatedAt: number;
};

// =========================
//  SESSIONS (tempo real)
// =========================

export type Session = {
  id: string;
  deckId: string; // universalDeckId ou userDeckId
  deckType: "universal" | "user";
  hostId: string;
  opened: boolean;
  createdAt: number;
};

export type SessionUser = {
  id: string; // userId
  name: string;
  score: number;
  joinedAt: number;
};

export type SessionAnswer = {
  id: string;
  userId: string;
  questionId: string;
  isCorrect: boolean;
  answeredAt: number;
};
