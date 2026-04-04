# Coding Conventions

**Analysis Date:** 2026-04-04

## Naming

- Frontend components and pages are mostly `PascalCase.tsx`, especially under `central-pet-front/src/Components/` and `central-pet-front/src/Pages/`.
- Helper modules use `camelCase.ts`, such as `central-pet-front/src/lib/api.ts` and `central-pet-front/src/Mocks/PetsStorage.ts`.
- Backend Nest files use the usual `*.module.ts`, `*.controller.ts`, `*.service.ts`, and `*.dto.ts` suffixes.
- Feature folders use kebab-case, like `central-pet-back/src/modules/adoption-requests/`.

## Exports

- The current frontend codebase still uses many default exports for React components and pages.
- Shared values, route maps, helpers, and types are usually named exports.
- Backend classes are named exports.

## Imports

- External packages are imported first.
- Frontend internal imports usually use the `@/` alias from `central-pet-front/tsconfig.json`.
- Relative imports are common in the backend, including Prisma client imports from `central-pet-back/generated/prisma/client`.

## TypeScript and Validation

- Frontend TypeScript is strict in `central-pet-front/tsconfig.json`.
- Backend is stricter around nullability and decorators, but still allows some warnings in ESLint.
- DTOs in `central-pet-back/src/modules/pets/dto/` use `class-validator` decorators for request validation.
- Frontend form state uses Zod schemas in `central-pet-front/src/Mocks/PetRegisterFormMock.ts`.

## Error Handling

- Backend domain failures use Nest exceptions like `BadRequestException`, `NotFoundException`, and `UnauthorizedException`.
- Backend bootstrap code fails fast when required env like `DATABASE_URL` is missing.
- Frontend storage helpers use defensive `try/catch` and fall back to defaults instead of throwing.
- `MyPetsPage.tsx` and `AdoptionRequestsReceivedPage.tsx` prefer API-first loading with local fallback behavior.

## Lint and Formatting Rules

- Frontend ESLint forbids `console` and `debugger`.
- Frontend intentionally allows underscore-prefixed unused values through its ESLint config.
- Backend ESLint warns on `any`, floating promises, and unsafe arguments instead of hard-failing.
- Prettier is used across the workspace through package scripts and lint-staged.

## Comment Style

- Comments are sparse and usually explain auth, mock data, or UI edge cases.
- TODOs are used for known debt, especially in `central-pet-front/src/App.tsx`, `central-pet-front/src/lib/auth/strategies/jwt.strategy.ts`, `central-pet-front/src/Components/Carousel.tsx`, and `central-pet-front/src/Pages/MyPetsPage.tsx`.
- There is some doc-comment usage in auth strategy files, but not a strong repository-wide JSDoc rule.

## Function Design

- Backend controllers stay thin and delegate to services.
- Backend services return `{ message, data }` envelopes.
- Frontend helpers prefer small pure functions plus type guards.
- React components own UI state and render directly rather than using class-based patterns.

## Domain Conventions

- Mock auth uses the localStorage key `central-pet:mock-user-id` and the header `x-mock-user-id`.
- Backend pet endpoints prefer `responsibleUserId` from the mock header when present.
- Many current flows still depend on seed/mock data in `central-pet-back/src/mocks/` and `central-pet-front/src/Mocks/`.

---

_Convention analysis: 2026-04-04_
