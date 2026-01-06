import { Question } from "@/types";

export interface Deck {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export const DECKS: Deck[] = [
  {
    id: "general-easy",
    title: "Conhecimentos Gerais (Fácil)",
    description: "Perguntas básicas sobre a Bíblia para iniciantes.",
    questions: [
      {
        id: "q1",
        text: "Quem construiu a arca?",
        type: "multiple_choice",
        options: ["Moisés", "Noé", "Abraão", "Davi"],
        correctAnswer: "Noé",
        timeLimit: 30
      },
      {
        id: "q2",
        text: "Qual é o primeiro livro da Bíblia?",
        type: "multiple_choice",
        options: ["Êxodo", "Salmos", "Gênesis", "Mateus"],
        correctAnswer: "Gênesis",
        timeLimit: 30
      },
      {
        id: "q3",
        text: "Jesus nasceu em qual cidade?",
        type: "multiple_choice",
        options: ["Nazaré", "Jerusalém", "Belém", "Jericó"],
        correctAnswer: "Belém",
        timeLimit: 30
      },
      {
        id: "q4",
        text: "Davi derrotou o gigante Golias.",
        type: "true_false",
        correctAnswer: true,
        timeLimit: 30
      },
      {
        id: "q5",
        text: "Quantos apóstolos Jesus escolheu?",
        type: "multiple_choice",
        options: ["10", "12", "7", "3"],
        correctAnswer: "12",
        timeLimit: 30
      }
    ]
  },
  {
    id: "jesus-life",
    title: "Vida de Jesus",
    description: "Perguntas focadas nos milagres e ensinamentos de Jesus.",
    questions: [
      {
        id: "j1",
        text: "Qual foi o primeiro milagre de Jesus?",
        type: "multiple_choice",
        options: ["Andar sobre as águas", "Transformar água em vinho", "Curar um cego", "Multiplicar pães"],
        correctAnswer: "Transformar água em vinho",
        timeLimit: 30
      },
      {
        id: "j2",
        text: "Quem batizou Jesus?",
        type: "multiple_choice",
        options: ["Pedro", "João Batista", "Tiago", "Paulo"],
        correctAnswer: "João Batista",
        timeLimit: 30
      },
      {
        id: "j3",
        text: "Jesus ressuscitou Lázaro.",
        type: "true_false",
        correctAnswer: true,
        timeLimit: 30
      },
      {
        id: "j4",
        text: "Onde Jesus foi crucificado?",
        type: "multiple_choice",
        options: ["Gólgota", "Getsêmani", "Monte das Oliveiras", "Templo"],
        correctAnswer: "Gólgota",
        timeLimit: 30
      },
      {
        id: "j5",
        text: "Quantos dias Jesus ficou no deserto sendo tentado?",
        type: "multiple_choice",
        options: ["3 dias", "7 dias", "40 dias", "12 dias"],
        correctAnswer: "40 dias",
        timeLimit: 30
      }
    ]
  },
  {
    id: "old-testament",
    title: "Velho Testamento",
    description: "Desafios sobre profetas, reis e eventos antigos.",
    questions: [
      {
        id: "ot1",
        text: "Quem foi engolido por um grande peixe?",
        type: "multiple_choice",
        options: ["Jonas", "Daniel", "Elias", "Moisés"],
        correctAnswer: "Jonas",
        timeLimit: 30
      },
      {
        id: "ot2",
        text: "Quem liderou o povo de Israel na saída do Egito?",
        type: "multiple_choice",
        options: ["Josué", "Moisés", "Arão", "José"],
        correctAnswer: "Moisés",
        timeLimit: 30
      },
      {
        id: "ot3",
        text: "Salomão era conhecido por sua força física.",
        type: "true_false",
        correctAnswer: false,
        timeLimit: 30
      },
      {
        id: "ot4",
        text: "Quem foi jogado na cova dos leões?",
        type: "multiple_choice",
        options: ["Daniel", "Sadraque", "Davi", "Samuel"],
        correctAnswer: "Daniel",
        timeLimit: 30
      },
      {
        id: "ot5",
        text: "Qual profeta foi levado ao céu em uma carruagem de fogo?",
        type: "multiple_choice",
        options: ["Eliseu", "Elias", "Isaías", "Jeremias"],
        correctAnswer: "Elias",
        timeLimit: 30
      }
    ]
  }
];
