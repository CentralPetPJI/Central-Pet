# Technology Stack

**Analysis Date:** 2026-04-04

## Languages

- TypeScript is the main application language in `central-pet-front/src/`, `central-pet-back/src/`, and `tests/e2e/`.
- JavaScript appears in build and lint configs such as `central-pet-front/eslint.config.js`, `tests/eslint.config.js`, and the root `package.json`.
- YAML is used for workspace and container setup in `pnpm-workspace.yaml`, `docker-compose.dev.yml`, `docker-compose.prod.yml`, and `docker-compose.prod.prebuilt.yml`.
- Prisma schema code lives in `central-pet-back/prisma/schema/`.
- CSS is split across `central-pet-front/src/index.css`, `central-pet-front/src/App.css`, and component/layout styles.

## Runtime

- Node.js 24.12.0 is the standard container runtime in `docker-compose.dev.yml` and the production compose files.
- The frontend runs as a browser SPA mounted from `central-pet-front/src/main.tsx`.
- PostgreSQL is the backing database target; dev uses `postgres:16-alpine` and prod compose targets `postgres:17-alpine`.
- pnpm 10.30.1 is the workspace package manager from the root `package.json`.

## Frontend Stack

- React 18.3.1 with React Router DOM 7.13.1 powers the UI in `central-pet-front/src/main.tsx` and `central-pet-front/src/routes.tsx`.
- Vite 7.3.1 handles dev/build in `central-pet-front/package.json` and `central-pet-front/vite.config.ts`.
- Tailwind CSS 4.1.18 is wired through `@tailwindcss/vite`.
- Axios is used for backend calls in `central-pet-front/src/lib/api.ts`.
- Zod is used for frontend form validation in `central-pet-front/src/Mocks/PetRegisterFormMock.ts`.
- Lucide React provides icons in layout and header components.

## Backend Stack

- NestJS 11.1.x is the API framework in `central-pet-back/src/main.ts` and `central-pet-back/src/app.module.ts`.
- Prisma 7.5.0 is configured through `central-pet-back/prisma.config.ts` and `central-pet-back/src/prisma/prisma.service.ts`.
- The PostgreSQL adapter is `@prisma/adapter-pg`, with `pg` as the underlying driver.
- Request validation uses `class-validator` and `class-transformer`, enforced globally in `central-pet-back/src/main.ts`.

## Testing Stack

- Vitest runs frontend component tests defined by `central-pet-front/vitest.config.ts`.
- Testing Library and `@testing-library/jest-dom/vitest` support React assertions in `central-pet-front/src/test/setup.ts`.
- Jest runs backend unit and e2e tests from `central-pet-back/package.json` and `central-pet-back/test/jest-e2e.json`.
- Playwright runs the separate E2E workspace under `tests/`, configured by `tests/playwright.config.ts`.
- `@playwright/test` is isolated to the `tests/` package.

## Build and Tooling

- ESLint is configured per package in `central-pet-front/eslint.config.js`, `central-pet-back/eslint.config.mjs`, and `tests/eslint.config.js`.
- Prettier is used through package scripts and lint-staged at the repo root.
- Husky and lint-staged are installed at the root for pre-commit formatting/linting.
- Docker Compose is the main local and deployment orchestration mechanism.

## Key Dependencies

- Frontend: `react`, `react-dom`, `react-router-dom`, `axios`, `zod`, `lucide-react`, `vite`, and `vitest`.
- Backend: `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`, `@nestjs/config`, `@prisma/client`, `prisma`, `@prisma/adapter-pg`, `class-validator`, and `class-transformer`.
- E2E: `@playwright/test` in `tests/package.json`.

## Configuration

- Frontend path alias `@/*` maps to `central-pet-front/src/*` in `central-pet-front/tsconfig.json` and `central-pet-front/vite.config.ts`.
- Backend env loading happens through `ConfigModule.forRoot()` in `central-pet-back/src/app.module.ts`.
- Prisma reads `DATABASE_URL` through `import 'dotenv/config'` in `central-pet-back/prisma.config.ts`.
- Root scripts expose `dev:front`, `dev:back`, `test:front`, `test:back`, and `test:e2e`.
- `tests/playwright.config.ts` launches both app servers automatically for E2E.

---

_Stack analysis: 2026-04-04_
