export type GameMode = 'time' | 'all_answered';
export type QuestionType = 'multiple_choice' | 'true_false';
export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  avatar?: string;
  connected: boolean;
  currentAnswer?: string | boolean | null; // For the current question
  answerTimestamp?: number; // When the player answered
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[]; // For multiple choice
  correctAnswer: string | boolean;
  timeLimit?: number; // Specific time limit for this question in seconds
  reference?: string;
  referencePrice?: number;
  source?: string;
}

export interface GameSettings {
  mode: GameMode;
  timeLimitPerQuestion: number; // Default time limit in seconds
  showResultsAfterQuestion: boolean;
  dynamicScoring?: boolean;
}

export interface Room {
  code: string;
  hostId: string;
  status: GameStatus;
  players: Player[];
  questions: Question[];
  currentQuestionIndex: number;
  settings: GameSettings;
  createdAt: number;
  questionStartTime?: number; // Timestamp when the current question started
  isShowingResults?: boolean;
}
