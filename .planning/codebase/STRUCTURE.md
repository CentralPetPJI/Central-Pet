# Codebase Structure

**Analysis Date:** 2026-04-04

## Directory Layout

```text
Central-Pet/
├── central-pet-front/        # React + Vite frontend
├── central-pet-back/         # NestJS backend API
├── tests/                    # Playwright E2E workspace
├── .planning/codebase/       # Generated mapping docs
├── docker-compose.dev.yml    # Local dev orchestration
├── docker-compose.prod.yml   # Production compose stack
└── pnpm-workspace.yaml       # Workspace package list
```

## Frontend Structure

- `central-pet-front/src/main.tsx`: browser entry point.
- `central-pet-front/src/App.tsx`: app shell and route resolver.
- `central-pet-front/src/routes.tsx`: route registry and path builders.
- `central-pet-front/src/Components/`: reusable UI and feature sections.
- `central-pet-front/src/Pages/`: route-level screens.
- `central-pet-front/src/Layout/`: shared header/footer chrome.
- `central-pet-front/src/lib/`: API, auth, and environment helpers.
- `central-pet-front/src/Mocks/`: mock data, local-storage adapters, and form defaults.
- `central-pet-front/src/Models/`: shared frontend types.
- `central-pet-front/src/test/`: Vitest setup helpers.
- `central-pet-front/src/assets/`: static assets and images.

## Backend Structure

- `central-pet-back/src/main.ts`: Nest bootstrap.
- `central-pet-back/src/app.module.ts`: root module wiring.
- `central-pet-back/src/modules/`: domain modules, each with controller/service files.
- `central-pet-back/src/prisma/`: Prisma Nest integration.
- `central-pet-back/src/mocks/`: seed data shared by services.
- `central-pet-back/prisma/`: Prisma schema source and migrations.
- `central-pet-back/generated/`: generated Prisma client output.
- `central-pet-back/test/`: Jest e2e config and specs.

## E2E Structure

- `tests/package.json`: dedicated Playwright workspace.
- `tests/playwright.config.ts`: starts backend and frontend servers for E2E.
- `tests/e2e/`: browser-level scenarios.

## Key File Locations

- `central-pet-front/src/lib/api.ts`: shared API client.
- `central-pet-front/src/lib/auth-context.tsx`: auth state provider.
- `central-pet-front/src/Mocks/PetsStorage.ts`: browser pet repository.
- `central-pet-back/src/modules/pets/pets.controller.ts`: pet HTTP surface.
- `central-pet-back/src/modules/pets/pets.service.ts`: pet domain behavior.
- `central-pet-back/src/prisma/prisma.service.ts`: Prisma client provider.
- `central-pet-back/src/modules/mock-auth/mock-auth.controller.ts`: mock auth endpoints.
- `tests/e2e/pet-register.spec.ts`: representative E2E flow.

## Naming Conventions

- React components and pages are usually `PascalCase.tsx` under `Components/` and `Pages/`.
- Helper modules use `camelCase.ts` or `camelCase.tsx` when they are not UI components.
- Backend Nest files use `*.module.ts`, `*.controller.ts`, `*.service.ts`, and `*.dto.ts`.
- Feature folders use kebab-case, such as `central-pet-back/src/modules/pet-history/`.
- Shared route and helper values are exported by name; many React components still use default exports in the current codebase.

## Where to Add New Code

- New frontend screens: `central-pet-front/src/Pages/`.
- New reusable UI: `central-pet-front/src/Components/`.
- New browser storage helpers or mock adapters: `central-pet-front/src/Mocks/` or `central-pet-front/src/lib/`.
- New backend features: `central-pet-back/src/modules/<feature>/`.
- New backend DTOs: `central-pet-back/src/modules/<feature>/dto/`.
- New e2e coverage: `tests/e2e/`.

---

_Structure analysis: 2026-04-04_

- Shared frontend helpers: Prefer the closest feature folder first; promote only broadly reused helpers into a dedicated shared location after a second consumer exists.
- Shared backend helpers: Keep feature-local helpers inside the feature folder unless multiple modules use them, then introduce a focused shared folder under `central-pet-back/src/`.

## Special Directories

**`central-pet-front/dist/`:**

- Purpose: Frontend build output.
- Generated: Yes
- Committed: Yes in current repository state

**`central-pet-back/dist/`:**

- Purpose: Backend transpiled build output.
- Generated: Yes
- Committed: Yes in current repository state

**`central-pet-back/generated/`:**

- Purpose: Prisma generated client.
- Generated: Yes
- Committed: Yes in current repository state

**`central-pet-front/node_modules/` and `central-pet-back/node_modules/`:**

- Purpose: Installed dependencies for each app.
- Generated: Yes
- Committed: Yes in current repository state

**`.pnpm-store/`:**

- Purpose: Local pnpm package store cached in the repository workspace.
- Generated: Yes
- Committed: Yes in current repository state

---

_Structure analysis: 2026-03-27_
