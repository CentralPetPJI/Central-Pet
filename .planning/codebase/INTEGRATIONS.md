# External Integrations

**Analysis Date:** 2026-04-04

## Internal HTTP API

- The backend exposes its API under `/api` from `central-pet-back/src/main.ts`.
- Frontend requests go through the shared Axios instance in `central-pet-front/src/lib/api.ts`.
- `VITE_API_URL` can override the default frontend target, which falls back to `http://localhost:3000/api`.

## Backend Endpoints

- Health: `GET /api/health` from `central-pet-back/src/modules/health/health.controller.ts`.
- Mock auth: `GET /api/auth/me` and `GET /api/auth/mock-users` from `central-pet-back/src/modules/mock-auth/mock-auth.controller.ts`.
- Pets: `GET /api/pets`, `POST /api/pets`, `GET /api/pets/:id`, `PATCH /api/pets/:id` from `central-pet-back/src/modules/pets/pets.controller.ts`.
- Adoption requests: `GET /api/adoption-requests` from `central-pet-back/src/modules/adoption-requests/adoption-requests.controller.ts`.
- Personality traits: `GET /api/personality-traits` from `central-pet-back/src/modules/personality-traits/personality-traits.controller.ts`.
- Pet history: `GET /api/pet-history` is the module boundary, although the controller is still empty.

## Auth Integration

- Mock auth is driven by the frontend header `x-mock-user-id`, set in `central-pet-front/src/lib/api.ts`.
- The stored browser key is `central-pet:mock-user-id` in `central-pet-front/src/lib/mock-auth.ts`.
- Backend modules read the same header in `central-pet-back/src/modules/mock-auth/mock-auth.controller.ts`, `central-pet-back/src/modules/pets/pets.controller.ts`, and `central-pet-back/src/modules/adoption-requests/adoption-requests.controller.ts`.
- This is dev/mock auth only; the JWT strategy in `central-pet-front/src/lib/auth/strategies/jwt.strategy.ts` is a stub.

## Data Storage

- Frontend browser storage is used heavily through `central-pet-front/src/Mocks/PetsStorage.ts` and `central-pet-front/src/lib/mock-auth.ts`.
- Local storage keys include `central-pet:pets`, `central-pet:pet-profiles`, `central-pet:register-form`, and `central-pet:mock-user-id`.
- Backend persistence is wired to PostgreSQL through Prisma, but current feature services still use in-memory arrays or seed objects.
- `DATABASE_URL` is required by `central-pet-back/src/prisma/prisma.service.ts` and `central-pet-back/prisma.config.ts`.

## Database / ORM

- PostgreSQL is the intended database integration in `docker-compose.dev.yml` and `docker-compose.prod.yml`.
- Prisma uses `@prisma/adapter-pg` in `central-pet-back/src/prisma/prisma.service.ts`.
- The generated client is imported from `central-pet-back/generated/prisma/client`.

## App and Test Orchestration

- `tests/playwright.config.ts` starts the backend and frontend servers automatically for E2E runs.
- The E2E package uses the root scripts `pnpm dev:back` and `pnpm dev:front`.
- Development compose can boot frontend, backend, and Postgres together from `docker-compose.dev.yml`.

## File / Asset Storage

- Frontend assets live in `central-pet-front/src/assets/`.
- Pet images are currently stored as browser strings in the local mock form/data layer rather than an external file service.
- No S3, Cloudinary, or similar file service is wired into the current codebase.

---

_Integration audit: 2026-04-04_
