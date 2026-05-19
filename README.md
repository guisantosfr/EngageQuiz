# EngageQuiz

<img src="./web/assets/question-web.jpg" alt="Question screen on web" width="446">

<img src="./mobile/assets/question-mobile.jpeg" alt="Question screen on mobile" width="240">

Aplicação multiplataforma para criação e participação em quizzes em tempo real, projetado para engajar alunos em sala de aula de forma interativa e dinâmica.

---

## 🎯 Funcionalidades

O projeto é dividido em dois grandes fluxos de experiência:

### Para Professores (Painel Web)
* **Gestão de Quizzes:** Criação, edição e exclusão de questionários.
* **Sessões em Tempo Real:** Iniciar sessões de jogo, controlando o avanço das perguntas.
* **Acompanhamento:** Visualização dos resultados e do desempenho dos alunos ao final de cada quiz.

### Para Alunos (Aplicativo Mobile)
* **Acesso Simples:** Entrada nas sessões usando códigos.
* **Interatividade:** Responder às perguntas em tempo real de seus próprios dispositivos.
* **Gamificação:** Feedback de desempenho e visão da classificação geral.

---

## 🏗️ Arquitetura e Tecnologias

O EngageQuiz é construído com tecnologias modernas, garantindo escalabilidade e performance.

![Diagrama de Arquitetura]([Insira imagens aqui])

### Por que um Monorepo?
Adotei a estrutura de **Monorepo** para manter todos os componentes da aplicação (backend, frontend web e app mobile) em um único lugar. Isso facilita o desenvolvimento, compartilhamento de conhecimentos e garante que as modificações fiquem sincronizadas entre os serviços.

### Tecnologias Principais
* **Backend:** [NestJS](https://nestjs.com/) com TypeScript, Prisma ORM e PostgreSQL. Comunicação via REST e WebSockets (Socket.io).
* **Frontend Web:** [Next.js](https://nextjs.org/) (React) com Tailwind CSS e componentes da ShadcnUI.
* **Mobile:** [React Native](https://reactnative.dev/) com o framework [Expo](https://expo.dev/).

---

## 📂 Estrutura do Repositório

| Diretório | Descrição | Link para o README interno |
| :--- | :--- | :--- |
| `backend/` | API REST e servidor WebSocket que gerencia questionários, sessões e banco de dados. | [🔗 Ver README do Backend](./backend/README.md) |
| `web/` | Painel administrativo voltado para os professores criarem e gerenciarem os questionários. | [🔗 Ver README da Web](./web/README.md) |
| `mobile/` | Aplicativo utilizado pelos alunos para participar dos questionários em tempo real. | [🔗 Ver README do Mobile](./mobile/README.md) |

---

## 🚀 Pré-requisitos Gerais

Para rodar o projeto localmente, você precisará de:
* [Node.js](https://nodejs.org/) (versão LTS recomendada, ex: 18+ ou 20+)
* Um gerenciador de pacotes (npm, yarn ou pnpm)
* [PostgreSQL](https://www.postgresql.org/) (rodando localmente ou via Docker)
* [Expo Go](https://expo.dev/go) instalado em seu smartphone para testar o app mobile, ou um emulador (Android Studio / Xcode).

> **Atenção:** As configurações de variáveis de ambiente (`.env`) e os comandos de execução específicos estão detalhados no README de cada diretório.

---

## 🗺️ Roadmap (Futuro)

- [ ] Implementar autenticação e perfis de usuário (ADM, Professor, Aluno).
- [ ] Testes Automatizados.
- [ ] Dashboards e relatórios de desempenho.
- [ ] Novos tipos de questão.
