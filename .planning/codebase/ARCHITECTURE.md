# Architecture

**Analysis Date:** 2026-04-04

## Pattern Overview

- The repo is a monorepo with a React SPA frontend and a NestJS HTTP API backend.
- Frontend UI code lives in `central-pet-front/src/`; backend API code lives in `central-pet-back/src/`.
- The frontend is page-driven: `main.tsx` mounts `App.tsx`, which renders route objects from `src/routes.tsx`.
- The backend is module-driven: each feature sits under `central-pet-back/src/modules/<feature>/` with controller/service pairs.

## Frontend Layers

- **Bootstrap**: `central-pet-front/src/main.tsx` mounts React inside `BrowserRouter` and `AuthProvider`.
- **Shell**: `central-pet-front/src/App.tsx` renders shared chrome (`Header`, `Footer`, optional `SidePanel`) around routed content.
- **Routing**: `central-pet-front/src/routes.tsx` centralizes path strings and route builders.
- **Pages**: `central-pet-front/src/Pages/` contains screen-level components such as `MainPage.tsx`, `MyPetsPage.tsx`, and `Pet/*`.
- **Reusable UI**: `central-pet-front/src/Components/` holds feature sections, forms, and shared widgets.
- **Client data layer**: `central-pet-front/src/Mocks/` and `central-pet-front/src/lib/` adapt browser storage, mock auth, and local seed data.

## Backend Layers

- **Bootstrap**: `central-pet-back/src/main.ts` creates the app, applies CORS, adds `/api`, and registers global validation.
- **Composition**: `central-pet-back/src/app.module.ts` wires `ConfigModule`, `PrismaModule`, and feature modules.
- **Feature modules**: `health`, `mock-auth`, `pets`, `adoption-requests`, `personality-traits`, and `pet-history`.
- **Transport**: controllers under `central-pet-back/src/modules/*/*.controller.ts` translate HTTP into service calls.
- **Domain**: services under `central-pet-back/src/modules/*/*.service.ts` hold the feature logic.
- **Infrastructure**: `central-pet-back/src/prisma/prisma.service.ts` provides Prisma client access.

## Data Flow

1. Browser loads `central-pet-front/src/main.tsx`.
2. `App.tsx` resolves the current route and renders the matching page.
3. Pages fetch API data through `central-pet-front/src/lib/api.ts` or read browser storage through `central-pet-front/src/Mocks/PetsStorage.ts`.
4. The frontend sends `x-mock-user-id` on requests when mock auth is active.
5. Backend controllers read the header, validate DTOs, and call the relevant service.

## Frontend State Model

- Auth state is centralized in `central-pet-front/src/lib/auth-context.tsx`.
- Mock auth bootstraps from `GET /auth/mock-users` and `GET /auth/me`.
- Most pet drafts and saved records still live in browser storage.
- `MyPetsPage.tsx` and `AdoptionRequestsReceivedPage.tsx` prefer API data, then fall back to local data when the API is unavailable.

## Backend State Model

- `PetsService` uses a private in-memory array seeded from `central-pet-back/src/mocks/pets.mock.ts` outside tests.
- `AdoptionRequestsService` and `PetHistoryService` read from seed arrays under `central-pet-back/src/mocks/`.
- `PrismaService` is initialized globally, but feature services are not yet backed by database reads/writes.

## Key Abstractions

- **Route map**: `central-pet-front/src/routes.tsx` keeps URL patterns in one place.
- **Local storage repository**: `central-pet-front/src/Mocks/PetsStorage.ts` hides browser parsing and fallback logic.
- **Mock auth contract**: `central-pet-front/src/lib/mock-auth.ts` and `central-pet-back/src/modules/mock-auth/` agree on the user header and mock-user list shape.
- **Nest feature module**: `central-pet-back/src/modules/pets/pets.module.ts` is the template for a vertical slice.
- **DTO validation contract**: `central-pet-back/src/modules/pets/dto/create-pet.dto.ts` and `update-pet.dto.ts` define request shape and constraints.

## Entry Points

- Frontend app entry: `central-pet-front/src/main.tsx`
- Frontend shell: `central-pet-front/src/App.tsx`
- Backend app entry: `central-pet-back/src/main.ts`
- Backend root module: `central-pet-back/src/app.module.ts`
- E2E entry: `tests/playwright.config.ts`, which starts the dev servers before running the Playwright suite

---

_Architecture analysis: 2026-04-04_

**Frontend Route Shell:**

- Location: `central-pet-front/src/App.tsx`
- Triggers: Every frontend navigation
- Responsibilities: Register routed pages, render layout chrome, derive side-panel summary from stored pet data

**Backend App Entry:**

- Location: `central-pet-back/src/main.ts`
- Triggers: `npm run start`, `npm run dev`, Nest build/start flows in `central-pet-back/package.json`
- Responsibilities: Create Nest app, configure CORS, apply validation, expose `/api`

**Backend Root Module:**

- Location: `central-pet-back/src/app.module.ts`
- Triggers: Nest bootstrap
- Responsibilities: Assemble global config, infrastructure, and feature modules

**Prisma Schema Entry:**

- Location: `central-pet-back/prisma/schema/`
- Triggers: `npm run prisma:generate`, `postinstall`
- Responsibilities: Define generator/datasource configuration and generated client output path

## Error Handling

**Strategy:** Validate input early and throw framework exceptions for request-level failures.

**Patterns:**

- Backend rejects invalid request bodies globally with `ValidationPipe` in `central-pet-back/src/main.ts`.
- Backend feature services throw typed Nest exceptions such as `NotFoundException` in `central-pet-back/src/modules/pets/pets.service.ts`.
- Frontend storage adapters in `central-pet-front/src/Mocks/PetsStorage.ts` recover from malformed local storage by clearing keys and falling back to seed data.

## Cross-Cutting Concerns

**Logging:** Nest bootstrap logging is created with `Logger` in `central-pet-back/src/main.ts`. No shared frontend logging abstraction is present.

**Validation:** Frontend form validation uses Zod through `central-pet-front/src/Mocks/PetRegisterFormMock.ts`. Backend request validation uses `class-validator` DTOs and the global `ValidationPipe` in `central-pet-back/src/main.ts`.

**Authentication:** Not implemented in active code. `routes.login` exists in `central-pet-front/src/routes.tsx`, but there is no mounted login page and no backend auth module under `central-pet-back/src/modules/`.

---

_Architecture analysis: 2026-03-27_
