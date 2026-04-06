# Central-Pet

Plataforma web para cadastro, visibilidade e adoção de animais abandonados ou em situação de rua. O objetivo e acelerar o encontro entre adotantes, protetores independentes, ONGs e abrigos de pequeno porte, reunindo todas as informacoes em um unico lugar.

## Visao do Projeto

O Central-Pet organiza a jornada de adocao e apoio a animais resgatados, oferecendo um fluxo simples de cadastro, busca e atualizacao das informacoes.

## Funcionalidades

- Cadastro de pets disponiveis para adocao
- Busca e filtros por localizacao, especie, porte e outros criterios
- Cadastro de usuarios (adotantes, protetores, ONGs)
- Apadrinhamento e doacoes (em breve)
- Denuncia de maus-tratos/abandono (em breve)
- Painel de administracao para ONGs/resgatistas (em breve)

## Stack

- **Frontend:** React 18+, TypeScript (strict), Tailwind CSS, Zustand, React Hook Form + Zod, Vite
- **Backend:** NestJS, TypeScript, Prisma ORM, PostgreSQL
- **DevOps:** Docker, Docker Compose, Husky + lint-staged
- **Testes:** Jest (backend), Playwright E2E, vitest (frontend)

## Estrutura de Pastas

```
central-pet-back/
  Dockerfile
  prisma/
  src/
    modules/

central-pet-front/
  Dockerfile
  src/
    Components/
    Layout/
    Pages/
    Models/
    Mock/
    assets/
```

## Como rodar localmente

### Pré-requisitos

- Node.js 24
- pnpm
- Docker (para PostgreSQL)

### Setup inicial

1. Clone o repositório:

   ```zsh
   git clone https://github.com/CentralPetPJI/Central-Pet
   cd Central-Pet
   ```

2. Instale as dependências:

   ```zsh
   pnpm install
   ```

3. Inicie o PostgreSQL:

   ```zsh
   docker compose -f docker-compose.dev.yml up postgres -d
   ```

4. Configure o banco de dados:

   ```zsh
   cd central-pet-back
   pnpm prisma migrate deploy
   ```

5. Inicie o projeto em modo desenvolvimento:

   ```zsh
   cd ..
   pnpm dev
   ```

   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:3000/api`

### Ambientes

O backend possui dois ambientes configurados:

- **Desenvolvimento** (`.env`):
  - Porta: 3000
  - Banco: `centralpetdb`
  - Comando: `pnpm dev:back`

- **Testes** (`.env.test`):
  - Porta: 3001
  - Banco: `centralpetdb_test`
  - Comando: `pnpm dev:back:test`
  - Usado automaticamente pelos testes E2E (Playwright)

### Comandos úteis

```zsh
# Desenvolvimento
pnpm dev:front          # Inicia frontend (porta 5173)
pnpm dev:back           # Inicia backend em dev (porta 3000)
pnpm dev:back:test      # Inicia backend em teste (porta 3001)

# Testes
pnpm test:front         # Testes unitários frontend (Vitest)
pnpm test:back          # Testes unitários backend (Jest)
pnpm test:e2e           # Testes E2E (Playwright)
pnpm test:all           # Todos os testes

# Lint
pnpm lint:front         # ESLint frontend
pnpm lint:back          # ESLint backend
```

## Como rodar com Docker

### Desenvolvimento

```zsh
docker compose -f docker-compose.dev.yml up
```

Aplicacao disponivel em `http://localhost:5173`.

### Producao

```zsh
docker compose -f docker-compose.prod.yml up --build
```

Aplicacao disponivel em `http://localhost:8080`.

Os arquivos `docker-compose` ficam na raiz para orquestrar o monorepo, e cada aplicacao mantem seu proprio `Dockerfile`: [central-pet-front/Dockerfile](./central-pet-front/Dockerfile) e [central-pet-back/Dockerfile](./central-pet-back/Dockerfile).

## Contribuicao

As diretrizes de contribuicao, padroes de codigo e estilo de commits estao no arquivo [CONTRIBUTING.md](./CONTRIBUTING.md). Consulte esse arquivo antes de abrir issues ou enviar Pull Requests.

---

Feito para aproximar quem ajuda de quem precisa de um lar.
