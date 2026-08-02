# EngageQuiz

<p style="display: flex; justify-content: center; align-items: center; gap: 50px;">
  <img src="./web/assets/question-web.jpg" alt="Question screen on web" width="446">
  <img src="./mobile/assets/question-mobile.jpeg" alt="Question screen on mobile" width="180">
</p>

Aplicação multiplataforma para criação e participação em quizzes em tempo real, projetado para engajar alunos em sala de aula de forma interativa e dinâmica.

---

## 🎯 Funcionalidades

O projeto é dividido em dois grandes fluxos de experiência:

### Para Professores (Painel Web)
* **Autenticação & Autorização:** Cadastro, login e logout seguros com controle de acesso baseado em papéis (`TEACHER` / `ADMIN`).
* **Gestão de Quizzes:** Criação, edição, exclusão e geração assistida por IA de questionários.
* **Sessões em Tempo Real:** Iniciar sessões de jogo, controlando o avanço das perguntas.
* **Acompanhamento:** Visualização dos resultados e do desempenho dos alunos ao final de cada quiz.

### Para Alunos (Aplicativo Mobile)
* **Autenticação & Perfis:** Acesso individualizado (`STUDENT`) com armazenamento seguro de credenciais.
* **Acesso Simples:** Entrada nas sessões usando códigos.
* **Interatividade:** Responder às perguntas em tempo real de seus próprios dispositivos.
* **Gamificação:** Feedback de desempenho e visão da classificação geral.

---

## 🏗️ Arquitetura e Tecnologias

O EngageQuiz é construído com tecnologias modernas, garantindo escalabilidade e performance.

![Diagrama de Arquitetura](./web/assets/diagram.png)

### Por que um Monorepo?
Adotei a estrutura de **Monorepo** para manter todos os componentes da aplicação (backend, frontend web e app mobile) em um único lugar. Isso facilita o desenvolvimento, compartilhamento de conhecimentos e garante que as modificações fiquem sincronizadas entre os serviços.

### Tecnologias Principais
* **Backend:** [NestJS](https://nestjs.com/) com TypeScript, Prisma ORM, JWT (Passport) e PostgreSQL. Comunicação via REST e WebSockets (Socket.io).
* **Frontend Web:** [Next.js](https://nextjs.org/) (React) com Tailwind CSS, Server Actions e componentes da ShadcnUI.
* **Mobile:** [React Native](https://reactnative.dev/) com [Expo](https://expo.dev/) e `expo-secure-store`.

---

## 📂 Estrutura do Repositório

| Diretório | Descrição | Link para o README interno |
| :--- | :--- | :--- |
| `backend/` | API REST e servidor WebSocket que gerencia questionários, sessões, autenticação e banco de dados. | [🔗 Ver README do Backend](./backend/README.md) |
| `web/` | Painel administrativo voltado para os professores criarem e gerenciarem os questionários. | [🔗 Ver README da Web](./web/README.md) |
| `mobile/` | Aplicativo utilizado pelos alunos para participar dos questionários em tempo real. | [🔗 Ver README do Mobile](./mobile/README.md) |
| `docs/` | Guia completo de integração do módulo de Autenticação para os clientes Web e Mobile. | [🔗 Guia de Integração de Auth](./docs/AUTH_INTEGRATION_GUIDE.md) |

---

## 🚀 Pré-requisitos Gerais

Para rodar o projeto localmente, você precisará de:
* [Node.js](https://nodejs.org/) (versão LTS recomendada, ex: 18+ ou 20+)
* Um gerenciador de pacotes (npm, yarn ou pnpm)
* [PostgreSQL](https://www.postgresql.org/) (rodando localmente ou via Docker)
* [Expo Go](https://expo.dev/go) instalado em seu smartphone para testar o app mobile, ou um emulador (Android Studio / Xcode).

> **Atenção:** As configurações de variáveis de ambiente (`.env`) e os comandos de execução específicos estão detalhados no README de cada diretório.

---

## 🗺️ Roadmap

- [x] Implementar autenticação e perfis de usuário (`ADMIN`, `TEACHER`, `STUDENT`) com suporte a JWT Access & Refresh tokens.
- [x] Testes Automatizados no Backend (Auth, Quizzes, Sessions, Gateway WebSocket).
- [ ] Dashboards e relatórios detalhados de desempenho.
- [ ] Novos tipos de questão.
