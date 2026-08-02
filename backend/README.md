# EngageQuiz - Backend

Esta pasta contém o código do **Backend** do ecossistema EngageQuiz, responsável por gerenciar as regras de negócio, persistência de dados, autenticação/autorização e a comunicação em tempo real entre o painel do professor e o aplicativo dos alunos.

---

## 🛠️ Tecnologias Específicas

* **[NestJS](https://nestjs.com/):** Framework Node.js estruturado e escalável utilizado como base para a API REST e WebSockets.
* **[Passport.js & JWT](https://www.passportjs.org/):** Gerenciamento de autenticação via JSON Web Tokens (Access e Refresh Tokens).
* **[bcrypt](https://github.com/kelektiv/node.bcrypt.js):** Criptografia segura para hash de senhas de usuários.
* **[Prisma ORM](https://www.prisma.io/):** ORM moderno utilizado para modelar o banco de dados, realizar migrações e acessar os dados de forma tipada.
* **[PostgreSQL](https://www.postgresql.org/):** Banco de dados relacional principal.
* **[Socket.io](https://socket.io/):** Biblioteca para comunicação bidirecional em tempo real (WebSockets), fundamental para a sincronização das sessões de quiz.
* **[@google/genai](https://github.com/google/genai):** Integração com o Google Gemini para recursos avançados de IA (geração automatizada de quizzes).

---

## 🔐 Módulo de Autenticação (`src/auth`)

O módulo de autenticação implementa rotas públicas e protegidas por meio de Guards globais do NestJS:

* **Endpoints Principais (`/auth`):**
  * `POST /auth/register`: Cadastro de novos usuários (pode definir papel `TEACHER` ou `STUDENT`).
  * `POST /auth/login`: Autenticação e emissão do par de tokens (`accessToken` e `refreshToken`).
  * `POST /auth/logout`: Encerramento de sessão.
  * `POST /auth/refresh`: Emissão de novo `accessToken` utilizando um `refreshToken` válido.
* **Segurança & Guards Globais:**
  * **`JwtAuthGuard`**: Aplicado globalmente em todas as rotas da API. Rotas públicas utilizam o decorator `@Public()`.
  * **`RolesGuard`**: Garante autorização por papel (`ADMIN`, `TEACHER`, `STUDENT`) usando o decorator `@Roles(...)`.
  * **Estratégia JWT**: `JwtStrategy` extrai o token do cabeçalho `Authorization: Bearer <token>` e injeta o objeto de usuário (`id`, `userId`, `email`, `role`) nas requisições.

---

## ⚙️ Pré-requisitos e Configuração

Certifique-se de ter o Node.js e um gerenciador de pacotes instalado (`npm`, `yarn` ou `pnpm`). Você também precisará de uma instância do PostgreSQL rodando localmente (ou via Docker).

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz da pasta `backend/` seguindo o modelo disponível em `env.example`:

```env
# Exemplo de .env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/engagequiz?schema=public"
JWT_SECRET="seu_segredo_super_seguro_jwt"
GEMINI_API_KEY="sua_chave_de_api_do_gemini"
```

---

## 🚀 Executando o Projeto

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Gere os artefatos do Prisma e rode as migrações:**
   Para garantir que seu banco de dados está atualizado com o schema atual:
   ```bash
   npm run migrate:dev
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   O servidor NestJS iniciará, normalmente exposto na porta `3000` (ou a configurada) e estará pronto para receber conexões REST e WebSocket.

---

## 🧪 Testes Automatizados

O backend conta com testes unitários para os controllers, serviços e gateway WebSocket:

```bash
# Executa todos os testes unitários (Auth, Quizzes, Sessions, Gateway)
npm test

# Executa os testes com relatório de cobertura
npm run test:cov
```

---

## 📜 Scripts Disponíveis

No arquivo `package.json`, você encontrará os seguintes scripts úteis:

* `npm run build`: Compila a aplicação TypeScript para JavaScript na pasta `dist/`.
* `npm run start`: Inicia a aplicação a partir do código compilado.
* `npm run dev`: Inicia a aplicação em modo de desenvolvimento, assistindo a alterações nos arquivos (`--watch`).
* `npm run test`: Executa a suíte de testes unitários com Jest.
* `npm run migrate:dev`: Roda as migrações do banco de dados para o ambiente de desenvolvimento.
* `npm run migrate`: Roda as migrações em produção (aplica o estado final sem resetar dados).
* `pnpm run studio`: Abre o **Prisma Studio**, uma interface web na porta `5555` para visualizar e editar os dados do banco.

---

## 🔌 Peculiaridades (WebSockets e Sessões)

Este backend utiliza intensivamente WebSockets para gerenciar as "Sessões" de quiz. O `SessionsGateway` (`src/sessions`) gerencia a entrada de alunos, o avanço das perguntas controlado pelo professor e a emissão de resultados em tempo real.
Certifique-se de que o painel Web e o App Mobile estejam apontando corretamente para o endereço e porta configurados para os WebSockets neste serviço.
