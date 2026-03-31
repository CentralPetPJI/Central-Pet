# Technology Stack

**Analysis Date:** 2026-03-27

## Languages

**Primary:**

- TypeScript 5.x - application code in `central-pet-front/src/` and `central-pet-back/src/`
- JavaScript - tooling configs in `central-pet-front/eslint.config.js`, root `package.json`, and shell-adjacent Node config files

**Secondary:**

- YAML - workspace and deployment config in `pnpm-workspace.yaml`, `docker-compose.dev.yml`, `docker-compose.prod.yml`, and `.github/workflows/issue_updater.yml`
- Bash - deployment automation in `scripts/deploy-prod.sh` and `scripts/setup-single-droplet-prod.sh`
- Prisma schema - database schema definition in `central-pet-back/prisma/schema.prisma`
- CSS - styling in `central-pet-front/src/index.css`, `central-pet-front/src/App.css`, and layout CSS files under `central-pet-front/src/Layout/`

## Runtime

**Environment:**

- Node.js 24.12.0 in containerized dev and production builds via `docker-compose.dev.yml`, `central-pet-back/Dockerfile`, and `central-pet-front/Dockerfile`
- Browser runtime for the frontend SPA mounted from `central-pet-front/src/main.tsx`
- Nginx 1.27 Alpine serving the built frontend in `central-pet-front/Dockerfile`

**Package Manager:**

- pnpm 10.30.1 declared in root `package.json`
- Lockfile: present in `pnpm-lock.yaml`
- Workspace definition: `pnpm-workspace.yaml`

## Frameworks

**Core:**

- React 18.3.1 - frontend component runtime in `central-pet-front/package.json`
- React Router DOM 7.13.1 - client-side routing wired in `central-pet-front/src/main.tsx` and `central-pet-front/src/routes.tsx`
- Vite 7.3.1 - frontend dev server and bundler in `central-pet-front/package.json` and `central-pet-front/vite.config.ts`
- Tailwind CSS 4.1.18 - utility-first styling through `@tailwindcss/vite` in `central-pet-front/package.json` and `central-pet-front/vite.config.ts`
- NestJS 11.1.x - backend HTTP API framework in `central-pet-back/package.json`, bootstrapped from `central-pet-back/src/main.ts`
- Prisma 7.5.0 - database client and schema tooling in `central-pet-back/package.json`, `central-pet-back/prisma.config.ts`, and `central-pet-back/src/prisma/prisma.service.ts`

**Testing:**

- Vitest 4.1.0 - frontend unit/component tests in `central-pet-front/package.json` and `central-pet-front/vitest.config.ts`
- Playwright 1.58.2 - frontend end-to-end tests in `central-pet-front/package.json` and `central-pet-front/playwright.config.ts`
- Jest 30.3.0 - backend unit and e2e tests in `central-pet-back/package.json` and `central-pet-back/test/app.e2e-spec.ts`
- Testing Library - React DOM assertions in `central-pet-front/package.json` and `central-pet-front/src/test/setup.ts`
- Supertest 7.2.2 - backend HTTP endpoint testing in `central-pet-back/package.json` and `central-pet-back/test/app.e2e-spec.ts`

**Build/Dev:**

- TypeScript 5.9.x - compilation in `central-pet-front/package.json`, `central-pet-back/package.json`, `central-pet-front/tsconfig.json`, and `central-pet-back/tsconfig.json`
- ESLint 10.x - linting at the workspace root and per app in `package.json`, `central-pet-front/eslint.config.js`, and `central-pet-back/eslint.config.mjs`
- Prettier 3.8.1 - formatting in root `package.json`, `central-pet-front/.prettierrc`, and `central-pet-back/.prettierrc`
- Husky 9.1.7 + lint-staged 16.2.7 - pre-commit tooling in root `package.json`
- Docker Compose - local and production orchestration in `docker-compose.dev.yml` and `docker-compose.prod.yml`

## Key Dependencies

**Critical:**

- `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` - backend HTTP module system and server in `central-pet-back/package.json`
- `@nestjs/config` - environment loading in `central-pet-back/src/app.module.ts`
- `@prisma/client` and `prisma` - generated database client and schema tooling in `central-pet-back/package.json`
- `@prisma/adapter-pg` and `pg` - PostgreSQL transport for Prisma in `central-pet-back/src/prisma/prisma.service.ts`
- `class-validator` and `class-transformer` - request DTO validation enabled globally in `central-pet-back/src/main.ts`
- `react` and `react-dom` - frontend render tree in `central-pet-front/src/main.tsx`
- `react-router-dom` - route declarations in `central-pet-front/src/routes.tsx`
- `zod` - schema validation library available to the frontend in `central-pet-front/package.json`
- `lucide-react` - icon system available to the frontend in `central-pet-front/package.json`

**Infrastructure:**

- `@vitejs/plugin-react` - React integration for Vite in `central-pet-front/package.json`
- `@tailwindcss/vite` and `tailwindcss` - Tailwind v4 integration in `central-pet-front/vite.config.ts`
- `ts-jest` - Jest TypeScript transform in `central-pet-back/package.json`
- `jsdom` - browser-like frontend test environment in `central-pet-front/vitest.config.ts`
- `dotenv` - Prisma and backend env loading in `central-pet-back/package.json` and `central-pet-back/prisma.config.ts`

## Configuration

**Environment:**

- Root workspace scripts and package manager are defined in `package.json`
- Backend runtime loads `.env` through `ConfigModule.forRoot()` in `central-pet-back/src/app.module.ts`
- Prisma loads env through `import 'dotenv/config'` in `central-pet-back/prisma.config.ts`
- Production deploy expects `.env.prod`; development compose references `central-pet-back/.env`; example env files are present as `.env.example`, `.env.prod.example`, and `central-pet-back/.env.example`
- Required runtime variables referenced in code/config are `DATABASE_URL`, `FRONTEND_URL`, `PORT`, `FRONT_PORT`, `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` from `central-pet-back/src/main.ts`, `central-pet-back/src/prisma/prisma.service.ts`, `docker-compose.prod.yml`, and `scripts/setup-single-droplet-prod.sh`

**Build:**

- Workspace package boundaries are declared in `pnpm-workspace.yaml`
- Frontend build config is in `central-pet-front/vite.config.ts` with `@` and `@@` path aliases
- Frontend TypeScript config is in `central-pet-front/tsconfig.json`
- Frontend test configs are in `central-pet-front/vitest.config.ts` and `central-pet-front/playwright.config.ts`
- Backend TypeScript config is in `central-pet-back/tsconfig.json`
- Backend lint config is in `central-pet-back/eslint.config.mjs`
- Frontend lint config is in `central-pet-front/eslint.config.js`
- Backend Docker build is in `central-pet-back/Dockerfile`
- Frontend Docker build plus Nginx runtime config are in `central-pet-front/Dockerfile` and `central-pet-front/nginx.conf`

## Platform Requirements

**Development:**

- pnpm workspace install from the repo root using `pnpm-lock.yaml` and `pnpm-workspace.yaml`
- Node.js compatible with the Dockerized dev image `node:24.12.0-alpine` from `docker-compose.dev.yml`
- Docker and Docker Compose for the provided local stack in `docker-compose.dev.yml`
- PostgreSQL 16 if using the bundled dev database from `docker-compose.dev.yml`

**Production:**

- Containerized deployment through `docker-compose.prod.yml`
- Backend runs as a Node.js 24 Alpine container from `central-pet-back/Dockerfile`
- Frontend runs as Nginx 1.27 Alpine from `central-pet-front/Dockerfile`
- Optional internal PostgreSQL 17 container or an external PostgreSQL instance via `DATABASE_URL`, as documented by `docker-compose.prod.yml` and `scripts/deploy-prod.sh`
- Host-level Caddy reverse proxy on Ubuntu/Debian for single-droplet deployment in `scripts/setup-single-droplet-prod.sh`

---

_Stack analysis: 2026-03-27_
