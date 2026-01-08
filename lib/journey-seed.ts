import { Stage, Deck } from "@/types/journey";

export const SEED_STAGES: Stage[] = [
  {
    id: "visitor",
    title: "Visitante",
    description: "Seus primeiros passos no Salão do Reino.",
    order: 10,
    color: "bg-blue-500",
    slug: "visitante",
  },
  {
    id: "first-meeting",
    title: "Primeira Reunião",
    description: "Entendendo como funcionam as reuniões.",
    order: 20,
    color: "bg-green-500",
    slug: "primeira-reuniao",
  },
  {
    id: "first-memorial",
    title: "Primeira Celebração",
    description: "O evento mais importante do ano.",
    order: 30,
    color: "bg-purple-500",
    slug: "primeira-celebracao",
  },
  {
    id: "student",
    title: "Estudante",
    description: "Começando seu estudo bíblico regular.",
    order: 40,
    color: "bg-yellow-500",
    slug: "estudante",
  },
  {
    id: "assignments",
    title: "Fazer Partes",
    description: "Participando na Escola do Ministério Teocrático.",
    order: 50,
    color: "bg-orange-500",
    slug: "fazer-partes",
  },
  {
    id: "unbaptized-publisher",
    title: "Publicador Não Batizado",
    description: "Pregando as boas novas com a congregação.",
    order: 60,
    color: "bg-red-500",
    slug: "publicador-nao-batizado",
  },
  {
    id: "convention",
    title: "Congresso",
    description: "Grandes assembleias de adoração.",
    order: 70,
    color: "bg-indigo-500",
    slug: "congresso",
  },
  {
    id: "first-study",
    title: "Primeiro Estudo Pessoal",
    description: "Fortalecendo sua fé individualmente.",
    order: 80,
    color: "bg-teal-500",
    slug: "primeiro-estudo-pessoal",
  },
  {
    id: "baptized-publisher",
    title: "Publicador Batizado",
    description: "Dedicação e batismo.",
    order: 90,
    color: "bg-sky-500",
    slug: "publicador-batizado",
  },
];

export const SEED_DECKS: Deck[] = [
  // Visitante
  {
    id: "deck-1",
    stageId: "visitor",
    title: "Boas Vindas",
    description: "O que esperar da sua primeira visita?",
    order: 1,
    totalQuestions: 5,
    questions: [
        { id: "q1", text: "O que é um Salão do Reino?", type: "multiple_choice", options: ["Um local de adoração", "Um clube", "Uma escola"], correctAnswer: "Um local de adoração" },
        { id: "q2", text: "Quem pode visitar o Salão do Reino?", type: "true_false", correctAnswer: true, options: ["true", "false"] }
    ]
  },
  {
    id: "deck-2",
    stageId: "visitor",
    title: "O Salão do Reino",
    description: "Conhecendo o local de adoração.",
    order: 2,
    totalQuestions: 5,
    questions: [
        { id: "q3", text: "Onde ficam as caixas de donativos?", type: "multiple_choice", options: ["Na entrada", "No palco", "Não existem"], correctAnswer: "Na entrada" },
    ]
  },
  
  // Primeira Reunião
  {
    id: "deck-3",
    stageId: "first-meeting",
    title: "Cânticos do Reino",
    description: "Louvando a Jeová com música.",
    order: 1,
    totalQuestions: 5,
    questions: [
        { id: "q4", text: "Quem canta nas reuniões?", type: "multiple_choice", options: ["Todos os presentes", "Apenas um coral", "Ninguém"], correctAnswer: "Todos os presentes" },
    ]
  },
  {
    id: "deck-4",
    stageId: "first-meeting",
    title: "A Sentinela",
    description: "Como participar do estudo.",
    order: 2,
    totalQuestions: 5,
    questions: [
        { id: "q5", text: "Como é feito o estudo de A Sentinela?", type: "multiple_choice", options: ["Perguntas e Respostas", "Apenas leitura", "Debate livre"], correctAnswer: "Perguntas e Respostas" },
    ]
  },

  // Primeira Celebração
  {
    id: "deck-5",
    stageId: "first-memorial",
    title: "O Significado",
    description: "Por que celebramos a morte de Cristo?",
    order: 1,
    totalQuestions: 5,
    questions: [
        { id: "q6", text: "Quantas vezes por ano ocorre a Celebração?", type: "multiple_choice", options: ["Uma vez", "Todo mês", "Toda semana"], correctAnswer: "Uma vez" },
    ]
  },
];
