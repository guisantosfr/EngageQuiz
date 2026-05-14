# EngageQuiz - Web (Painel do Professor)

Esta pasta contém o **Frontend Web** do EngageQuiz. Trata-se do painel administrativo utilizado pelos professores para a criação de quizzes, visualização de resultados e gerenciamento das sessões de jogo em tempo real.

![Interface Web]([Insira imagens aqui])

---

## 🛠️ Tecnologias Específicas

* **[Next.js (App Router)](https://nextjs.org/):** Framework React utilizado para a construção da interface, garantindo renderização rápida e boa arquitetura de pastas.
* **[React](https://react.dev/):** Biblioteca para a construção das interfaces de usuário.
* **[Tailwind CSS](https://tailwindcss.com/):** Framework utilitário de CSS para estilização rápida e responsiva.
* **[Shadcn/UI](https://ui.shadcn.com/):** Coleção de componentes reutilizáveis construídos sobre o Radix UI, garantindo acessibilidade e um visual moderno.
* **[Socket.io-client](https://socket.io/):** Utilizado para a comunicação em tempo real com o servidor (ex: ver os alunos entrando na sala, ver resultados ao vivo).

---

## ⚙️ Pré-requisitos e Configuração

Certifique-se de que o [Backend](../backend/README.md) esteja rodando, pois o painel web precisa se comunicar com a API e o servidor WebSocket.

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz da pasta `web/`:

```env
# URL da API REST e WebSocket do Backend
NEXT_PUBLIC_API_URL="http://localhost:3000"
```
*(Altere a porta caso o seu backend esteja rodando em uma porta diferente).*

---

## 🚀 Executando o Projeto

1. **Instale as dependências:**
   ```bash
   npm install
   # ou yarn install / pnpm install
   ```

2. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

3. Abra o navegador em [http://localhost:3000](http://localhost:3000) (ou a porta indicada no terminal, ex: `3001` caso a `3000` esteja em uso pelo backend).

---

## 📜 Scripts Disponíveis

* `npm run dev`: Inicia a aplicação em modo de desenvolvimento.
* `npm run build`: Cria a versão otimizada para produção.
* `npm run start`: Inicia a aplicação construída (requer que o `build` tenha sido rodado antes).

---

## 🏗️ Peculiaridades

* **Server Actions:** O projeto utiliza Server Actions do Next.js (arquivos na pasta `_actions`) para as mutações e buscas de dados diretamente no servidor Next, antes de chamar a API NestJS, garantindo segurança e melhor integração.
* **Painel da Sessão:** A tela de execução de uma sessão ativa abre uma conexão via WebSocket com o backend para coordenar qual pergunta está ativa e atualizar a interface conforme os alunos respondem.
