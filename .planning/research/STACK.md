# Technology Stack

**Project:** Central-Pet
**Researched:** 2026-03-27

## Recommended Stack

This milestone does not need a stack reset. Keep the existing `React 18 + Vite 7 + Zod + Nest 11 + Prisma 7 + Playwright` foundation and add only the pieces that improve three things: richer responsible-profile modeling, structured contact CTAs, and deterministic E2E scenarios driven by user mocks.

### Core Framework

| Technology       | Version    | Purpose                                                                                | Why                                                                                              |
| ---------------- | ---------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| React            | `^18.3.1`  | Existing UI runtime                                                                    | No change needed; milestone is additive UI/state work.                                           |
| React Router DOM | `^7.13.1`  | Existing route handling                                                                | Enough for contact CTA flows and profile detail routing.                                         |
| Zod              | `^4.3.6`   | Shared domain validation for responsible/contact/trust fields                          | Already present in frontend; extend current schemas instead of adding a second validation layer. |
| NestJS           | `^11.1.17` | Backend API expansion when structured responsible/contact data moves off local storage | Keep current backend and add DTO/entity fields only if this milestone persists data server-side. |
| Prisma           | `^7.5.0`   | Persistence for responsible profile metadata and trust indicators                      | Already the right place for normalized responsible/profile tables if backend storage is used.    |

### Database

| Technology            | Version             | Purpose                                                                                                         | Why                                                                                   |
| --------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| PostgreSQL via Prisma | Existing project DB | Store structured responsible profiles, trust flags, and contact preferences when backend integration is enabled | Reuse the existing Nest/Prisma path; no new database or auth store is justified here. |

### Infrastructure

| Technology                        | Version                | Purpose                                                                   | Why                                                                                                      |
| --------------------------------- | ---------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Playwright                        | `^1.58.2`              | User-mock-driven E2E covering trust/contact flows                         | Already installed and configured; extend with fixtures and storage seeding rather than swapping tooling. |
| Vitest                            | `^4.1.0`               | Fast unit/integration coverage for schema mapping and indicator rendering | Best fit for frontend domain adapters and component states.                                              |
| localStorage-backed fixture layer | Existing `src/Mocks/*` | Deterministic frontend-only milestone scenarios                           | Current app already depends on it; formalize it instead of introducing MSW now.                          |

### Supporting Libraries

| Library                 | Version  | Purpose                                                                                                                     | When to Use                                                                                                                     |
| ----------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `@hookform/resolvers`   | `^5.x`   | Connect Zod schemas to forms if current manual state/validation becomes too noisy after adding responsible/contact sections | Add only if the register/edit form starts accumulating duplicated error plumbing.                                               |
| `react-hook-form`       | `^7.x`   | Manage larger structured forms with less manual state churn                                                                 | Recommended only if this milestone meaningfully expands the pet/responsible form. If edits stay small, keep current `useState`. |
| `@faker-js/faker`       | `^9.x`   | Generate varied but deterministic responsible/user/pet fixtures for E2E and factory helpers                                 | Use in test-only factories; seed faker so Playwright data stays reproducible.                                                   |
| `vitest` built-in mocks | Existing | Stub clipboard, share APIs, or nonessential browser edges in unit tests                                                     | Prefer this over adding new mocking frameworks.                                                                                 |

## Recommended Additions By Capability

### 1. Structured Contact Flows

Use the existing `zod` domain layer to introduce explicit contact models instead of storing freeform text in `notes`.

Recommended additions:

- Add a `ResponsibleProfile` shape with fields like `type`, `displayName`, `city`, `contactPreference`, `whatsapp`, `email`, `responseWindow`, `adoptionProcessSummary`.
- Add a `TrustSignals` shape with boolean or enum fields such as `identityChecked`, `organizationDocumented`, `adoptionFeePolicy`, `profileCompletedAt`.
- Add a `ContactCTA` mapping layer that derives the visible primary action from structured data.

Integration points:

- Frontend: extend [`central-pet-front/src/Mocks/PetRegisterFormMock.ts`](/home/vard/repos/my_repos/Central-Pet/central-pet-front/src/Mocks/PetRegisterFormMock.ts) to stop treating `tutor` and `contact` as the only responsible fields.
- Frontend storage: replace string-packed `notes` composition in [`central-pet-front/src/Mocks/PetsStorage.ts`](/home/vard/repos/my_repos/Central-Pet/central-pet-front/src/Mocks/PetsStorage.ts) with structured profile records plus a presentation mapper.
- Backend: mirror those fields into Nest DTOs and Prisma models only if the milestone actually migrates away from frontend-only persistence.

### 2. Trust/Profile Indicators

Do not add a reputation engine, moderation service, or external verification provider in this milestone. The pragmatic addition is a typed indicator model plus UI rendering rules.

Recommended implementation:

- Keep trust indicators declarative and explainable: responsible type, completed profile, health info completeness, city filled, preferred contact defined.
- Compute a small derived badge set in frontend selectors/helpers.
- If persisted on backend, store raw evidence fields and derive badges in application code, not as denormalized strings.

Supporting stack choice:

- `zod` remains enough for validation and normalization.
- No need for state libraries like Zustand, Redux, or XState for this scope.

### 3. User-Mock-Driven E2E

The app already has a mock/storage path and Playwright boots only the frontend. Lean into that.

Recommended additions:

- Add shared test factories under `central-pet-front/tests/e2e/fixtures/` or `central-pet-front/src/test/factories/`.
- Add a small seeding helper that writes deterministic arrays into the same storage keys used by [`central-pet-front/src/Mocks/PetsStorage.ts`](/home/vard/repos/my_repos/Central-Pet/central-pet-front/src/Mocks/PetsStorage.ts).
- Add Playwright custom fixtures for scenarios like `ongConfiavel`, `protetorBasico`, `tutorPessoaFisica`.
- Use `@faker-js/faker` only in test code, with an explicit seed per suite or per fixture file.

Playwright integration points:

- Seed `localStorage` with `page.addInitScript(...)` before `page.goto(...)`.
- Keep tests scenario-based and deterministic; do not depend on live backend state for this milestone.
- Add helper commands instead of duplicating raw JSON payloads across specs.

## Alternatives Considered

| Category          | Recommended                                                                                         | Alternative                                  | Why Not                                                                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Form handling     | Keep current `useState` + `zod`, optionally add `react-hook-form` only if form complexity tips over | Introduce RHF immediately everywhere         | Premature if the form changes are still moderate; adds migration work with limited payoff unless many new fields land now.  |
| E2E data strategy | Seed current `localStorage` mocks                                                                   | Add MSW                                      | Unnecessary while Playwright runs frontend-only flows and app logic already reads from local storage.                       |
| API mocking       | None for this milestone                                                                             | Add MirageJS / JSON Server / custom fake API | More moving parts than value; existing milestone focus is UI/domain confidence, not full client-server contract simulation. |
| State management  | Local component state + typed helpers                                                               | Zustand/Redux                                | No evidence of cross-app state complexity requiring a store.                                                                |
| Contact channel   | Structured CTA metadata                                                                             | Real-time chat / WebSocket stack             | Explicitly out of scope and would inflate backend and testing complexity.                                                   |

## What NOT to Add

- Do not add `msw` unless this milestone starts exercising frontend-backend contracts in the browser during tests.
- Do not add Redux, Zustand, XState, or another app-wide state layer.
- Do not add real-time chat, inbox, notification, or queue infrastructure.
- Do not add external identity verification, document OCR, or trust-scoring vendors.
- Do not add a second schema/validation system alongside `zod`.
- Do not add a separate E2E database just to simulate responsible profiles; deterministic fixture seeding is enough.

## Installation

If forms stay close to current complexity:

```bash
# No required production additions
pnpm --filter central-pet-front add -D @faker-js/faker
```

If the responsible/contact form expands enough to justify structured form management:

```bash
pnpm --filter central-pet-front add react-hook-form @hookform/resolvers
pnpm --filter central-pet-front add -D @faker-js/faker
```

## Integration Notes

- Frontend first: model responsible/contact/trust data in typed frontend schemas and storage helpers before touching backend.
- Backend second: only extend Nest DTOs and Prisma schema once frontend field semantics are stable.
- Tests should validate mapping layers, not only rendered text. Add unit tests for badge derivation and CTA generation.
- Prefer one canonical domain shape for responsible/contact data and derive view models from it for carousel/profile/register pages.

## Sources

- Local codebase analysis (HIGH confidence):
  - [`central-pet-front/package.json`](/home/vard/repos/my_repos/Central-Pet/central-pet-front/package.json)
  - [`central-pet-back/package.json`](/home/vard/repos/my_repos/Central-Pet/central-pet-back/package.json)
  - [`central-pet-front/playwright.config.ts`](/home/vard/repos/my_repos/Central-Pet/central-pet-front/playwright.config.ts)
  - [`central-pet-front/src/Components/PetRegister/PetRegisterForm.tsx`](/home/vard/repos/my_repos/Central-Pet/central-pet-front/src/Components/PetRegister/PetRegisterForm.tsx)
  - [`central-pet-front/src/Mocks/PetRegisterFormMock.ts`](/home/vard/repos/my_repos/Central-Pet/central-pet-front/src/Mocks/PetRegisterFormMock.ts)
  - [`central-pet-front/src/Mocks/PetsStorage.ts`](/home/vard/repos/my_repos/Central-Pet/central-pet-front/src/Mocks/PetsStorage.ts)
  - [`central-pet-front/tests/e2e`](/home/vard/repos/my_repos/Central-Pet/central-pet-front/tests/e2e)
  - [`.planning/PROJECT.md`](/home/vard/repos/my_repos/Central-Pet/.planning/PROJECT.md)
  - [`.planning/REQUIREMENTS.md`](/home/vard/repos/my_repos/Central-Pet/.planning/REQUIREMENTS.md)
  - [`.planning/codebase/STACK.md`](/home/vard/repos/my_repos/Central-Pet/.planning/codebase/STACK.md)
  - [`.planning/codebase/TESTING.md`](/home/vard/repos/my_repos/Central-Pet/.planning/codebase/TESTING.md)
