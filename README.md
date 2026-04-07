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

### Opção 1: Docker (RECOMENDADO) 🐳

**Um único comando para tudo funcionar:**

```zsh
# Clone e rode
git clone https://github.com/CentralPetPJI/Central-Pet
cd Central-Pet

# Opção A: usando pnpm
pnpm dev:docker

# Opção B: usando make
make dev
```

**Pronto!** O ambiente configura automaticamente:

- ✅ Cria `.env` do backend
- ✅ Instala dependências
- ✅ Aplica migrations do Prisma
- ✅ Aguarda PostgreSQL estar pronto
- ✅ Inicia frontend e backend

Acesse:

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000/api

**Outros comandos Docker:**

```zsh
pnpm dev:docker:down    # Parar containers
pnpm dev:docker:logs    # Ver logs em tempo real
pnpm dev:docker:clean   # Limpar tudo (incluindo banco)

# Ou com make:
make dev-down
make dev-logs
make dev-clean
```

### Opção 2: Desenvolvimento sem Docker

**Pré-requisitos:**

- Node.js 24
- pnpm
- PostgreSQL rodando (pode ser via Docker)

**Setup manual:**

1. Clone o repositório:

   ```zsh
   git clone https://github.com/CentralPetPJI/Central-Pet
   cd Central-Pet
   ```

2. Instale as dependências:

   ```zsh
   pnpm install
   ```

3. Configure o backend (crie `central-pet-back/.env`):

   ```env
   PORT=3000
   FRONTEND_URL=http://localhost:5173
   DATABASE_URL=postgresql://centralpet:centralpet123@localhost:5432/centralpetdb
   THROTTLE_TTL=60000
   THROTTLE_LIMIT=60
   ```

4. Inicie o PostgreSQL (se não tiver local):

   ```zsh
   docker run -d -p 5432:5432 \
     -e POSTGRES_DB=centralpetdb \
     -e POSTGRES_USER=centralpet \
     -e POSTGRES_PASSWORD=centralpet123 \
     postgres:17-alpine
   ```

5. Rode migrations:

   ```zsh
   pnpm --filter central-pet-back exec prisma migrate deploy
   ```

6. Inicie em modo dev:

   ```zsh
   pnpm dev
   ```

   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000/api

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

**Desenvolvimento:**

```zsh
# Docker (recomendado)
pnpm dev:docker          # Inicia tudo em containers
pnpm dev:docker:down     # Para containers
pnpm dev:docker:logs     # Logs em tempo real
pnpm dev:docker:clean    # Limpa tudo (volumes + containers)

# Local (sem Docker)
pnpm dev                 # Inicia front + back em paralelo
pnpm dev:front           # Só frontend (porta 5173)
pnpm dev:back            # Só backend dev (porta 3000)
pnpm dev:back:test       # Backend em teste (porta 3001)
```

**Testes:**

```zsh
pnpm test:front         # Testes unitários frontend (Vitest)
pnpm test:back          # Testes unitários + E2E backend (Jest)
pnpm test:e2e           # Testes E2E completos (Playwright)
pnpm test:all           # Todos os testes
```

**Build:**

```zsh
pnpm build:front        # Build de produção frontend
pnpm build:back         # Build de produção backend
```

## Como rodar com Docker

### Modo desenvolvimento (com hot-reload)

```zsh
# Jeito mais simples:
pnpm dev:docker
# ou
make dev

# Parar:
pnpm dev:docker:down
# ou
make dev-down
```

O ambiente dev monta os volumes locais, então mudanças no código refletem automaticamente.

### Modo produção (otimizado)

### Modo produção (otimizado)

```zsh
docker compose -f docker-compose.prod.yml up --build
```

Aplicação disponível em http://localhost:8080.

Os arquivos `docker-compose` ficam na raiz para orquestrar o monorepo, e cada aplicacao mantem seu proprio `Dockerfile`: [central-pet-front/Dockerfile](./central-pet-front/Dockerfile) e [central-pet-back/Dockerfile](./central-pet-back/Dockerfile).

## Contribuicao

As diretrizes de contribuicao, padroes de codigo e estilo de commits estao no arquivo [CONTRIBUTING.md](./CONTRIBUTING.md). Consulte esse arquivo antes de abrir issues ou enviar Pull Requests.

---

Feito para aproximar quem ajuda de quem precisa de um lar.
