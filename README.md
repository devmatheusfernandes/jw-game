
---

# 📘 **Bible Game Quiz — README**

## 🧩 Sobre o Projeto

**Bible Game Quiz** é um aplicativo focado em **jogos de perguntas bíblicas**, projetado para uso individual e em grupo.
A proposta é permitir que usuários respondam perguntas baseadas em textos bíblicos e conteúdos cristãos, com a possibilidade de jogar sozinhos ou em partidas **multiplayer em tempo real**.

O aplicativo inclui uma base de **perguntas e decks universais** criados por administradores, mas também permite que cada usuário crie **suas próprias perguntas e decks personalizados**, que só ele pode editar.

---

## 🔥 Funcionalidades

### ✔️ **Para todos os usuários**

* Login via Google
* Jogar quizzes
* Acessar decks universais oficiais
* Criar perguntas pessoais
* Criar decks pessoais
* Jogar sozinho (modo estudo)
* Participar de sessões multiplayer
* Acompanhar pontuação em tempo real

### ✔️ **Para administradores**

* Criar e editar perguntas universais
* Criar e editar decks universais
* Gerenciar tópicos
* Moderação do conteúdo

---

## 🔁 Fluxo de Uso

1. O usuário faz login com Google
2. Ele escolhe entre:

   * Jogar um deck universal
   * Jogar um deck pessoal
   * Criar suas próprias perguntas
   * Criar seus próprios decks
3. No multiplayer, o host cria uma sessão
4. Outros usuários entram via ID
5. O host inicia e todos respondem simultaneamente
6. Pontuação é atualizada em tempo real
7. Ao final, os resultados são exibidos

---

## 🎨 Design e UI

Utiliza:

* **TailwindCSS**
* **shadcn/ui**
* Padrões definidos em `styles.json` (tipografia, espaçamento, cores, padrões de UI)

A interface segue uma estética:

* Minimalista
* Limpa
* Focada em acessibilidade
* Rápida em dispositivos mobile

---

## 🚀 Tecnologias

* **Next.js 16** (App Router + Server Components)
* **Firebase** (Auth, Firestore, Realtime listeners)
* **Typescript**
* **TailwindCSS**
* **shadcn/ui**
* **Clean Architecture**
* **Framer Motion** (animações opcionais)

---
