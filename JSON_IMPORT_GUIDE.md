# Guia de Importação de Perguntas (JSON)

Este guia descreve a estrutura correta do arquivo JSON para importar perguntas em massa na área administrativa de Decks.

## Estrutura Geral

O arquivo deve conter um **array de objetos**, onde cada objeto representa uma pergunta.

```json
[
  {
    // Objeto da Pergunta 1
  },
  {
    // Objeto da Pergunta 2
  }
]
```

## Campos da Pergunta

Cada objeto de pergunta deve ter os seguintes campos:

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `text` | String | Sim | O texto da pergunta. |
| `type` | String | Sim | O tipo da pergunta. Valores aceitos: `"multiple_choice"` ou `"true_false"`. |
| `timeLimit` | Number | Não | Tempo limite em segundos. Padrão: `30`. |
| `options` | Array | Sim* | Array com 4 strings (opções de resposta). *Obrigatório apenas se `type` for `"multiple_choice"`. |
| `correctAnswer` | String/Boolean | Sim | A resposta correta. Deve corresponder exatamente a uma das opções (se múltipla escolha) ou `true`/`false` (se V/F). |

## Exemplos

### 1. Múltipla Escolha (`multiple_choice`)

```json
{
  "text": "Qual é a capital da França?",
  "type": "multiple_choice",
  "options": [
    "Londres",
    "Berlim",
    "Paris",
    "Madrid"
  ],
  "correctAnswer": "Paris",
  "timeLimit": 30
}
```

### 2. Verdadeiro ou Falso (`true_false`)

```json
{
  "text": "O sol gira em torno da Terra.",
  "type": "true_false",
  "correctAnswer": false,
  "timeLimit": 15
}
```

## Exemplo de Arquivo Completo

```json
[
  {
    "text": "Qual elemento químico tem o símbolo 'O'?",
    "type": "multiple_choice",
    "options": ["Ouro", "Oxigênio", "Ósmio", "Prata"],
    "correctAnswer": "Oxigênio",
    "timeLimit": 20
  },
  {
    "text": "A Grande Muralha da China é visível da Lua a olho nu.",
    "type": "true_false",
    "correctAnswer": false,
    "timeLimit": 15
  },
  {
    "text": "Quem pintou a Mona Lisa?",
    "type": "multiple_choice",
    "options": ["Van Gogh", "Da Vinci", "Picasso", "Michelangelo"],
    "correctAnswer": "Da Vinci",
    "timeLimit": 30
  }
]
```
