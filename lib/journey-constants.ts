import { Badge } from "@/types/journey";

export const BADGES: Badge[] = [
  // Journey Milestones
  {
    id: "welcome-aboard",
    title: "Bem-vindo a Bordo",
    description: "Completou a etapa de Visitante.",
    icon: "Handshake",
    condition: "Complete todos os decks da etapa Visitante",
  },
  {
    id: "first-steps",
    title: "Primeiros Passos",
    description: "Assistiu à primeira reunião.",
    icon: "Footprints",
    condition: "Complete todos os decks da etapa Primeira Reunião",
  },
  
  // Streaks
  {
    id: "streak-3",
    title: "Consistência Iniciante",
    description: "Acessou o jogo por 3 dias seguidos.",
    icon: "Flame",
    condition: "3 dias de ofensiva",
  },
  {
    id: "streak-7",
    title: "Hábito Formado",
    description: "Acessou o jogo por 7 dias seguidos.",
    icon: "Zap",
    condition: "7 dias de ofensiva",
  },
  {
    id: "streak-30",
    title: "Guerreiro da Fé",
    description: "Acessou o jogo por 30 dias seguidos.",
    icon: "Calendar",
    condition: "30 dias de ofensiva",
  },

  // Consecutive Answers
  {
    id: "combo-5",
    title: "No Caminho",
    description: "Acertou 5 perguntas seguidas.",
    icon: "Target",
    condition: "5 acertos consecutivos",
  },
  {
    id: "combo-10",
    title: "Mestre do Conhecimento",
    description: "Acertou 10 perguntas seguidas.",
    icon: "Brain",
    condition: "10 acertos consecutivos",
  },
  {
    id: "combo-20",
    title: "Imparável",
    description: "Acertou 20 perguntas seguidas.",
    icon: "Crown",
    condition: "20 acertos consecutivos",
  },

  // Score Levels
  {
    id: "level-1000",
    title: "Aprendiz",
    description: "Alcançou 1.000 pontos.",
    icon: "Star",
    condition: "1.000 pontos totais",
  },
  {
    id: "level-5000",
    title: "Estudioso",
    description: "Alcançou 5.000 pontos.",
    icon: "BookOpen",
    condition: "5.000 pontos totais",
  },
  {
    id: "level-10000",
    title: "Sábio",
    description: "Alcançou 10.000 pontos.",
    icon: "Scroll",
    condition: "10.000 pontos totais",
  }
];
