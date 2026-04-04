# Codebase Concerns

**Analysis Date:** 2026-04-04

## Tech Debt

### Split frontend/backend pet model

- The frontend still uses browser-local pet structures in `central-pet-front/src/Mocks/PetsStorage.ts` and `central-pet-front/src/Models/Types.ts`.
- The backend uses DTOs and mock seeds with a different shape in `central-pet-back/src/modules/pets/dto/create-pet.dto.ts` and `central-pet-back/src/mocks/pets.mock.ts`.
- This keeps the UI working even when the API contract is drifting, which makes future consolidation harder.

### Persistence is scaffolded but not used

- `central-pet-back/src/prisma/prisma.service.ts` and `central-pet-back/prisma/schema.prisma` exist, but `PetsService` still stores data in memory.
- `AdoptionRequestsService`, `PetHistoryService`, and `MockAuthService` all read from static seed arrays.
- Restarts erase backend pet writes, so the API is not yet a durable source of truth.

### Mock auth is still the real auth path

- The frontend sends `x-mock-user-id` from `central-pet-front/src/lib/api.ts`.
- The backend trusts that header in several controllers.
- `central-pet-front/src/lib/auth/strategies/jwt.strategy.ts` is only a stub, so real auth is not implemented yet.

## Known Bugs / Gaps

- `central-pet-back/src/modules/adoption-requests/adoption-requests.controller.ts` throws generic `Error` values for some invalid states instead of Nest exceptions.
- `central-pet-back/src/modules/pet-history/pet-history.controller.ts` is empty even though the module is registered.
- `central-pet-front/src/Pages/MyPetsPage.tsx` and `central-pet-front/src/Pages/AdoptionRequestsReceivedPage.tsx` fall back to localStorage when the API fails, which hides backend breakage.

## Security

- There is no real authentication or authorization on mutating pet endpoints.
- `responsibleUserId` can still be influenced by client-side data, even though the controller prefers the mock header.
- The app has no visible rate limiting or auth hardening in `central-pet-back/src/main.ts`.

## Performance / Scalability

- `central-pet-front/src/Mocks/PetsStorage.ts` synchronously parses localStorage during render paths.
- Pet images and drafts are stored in browser storage, which does not scale well and can hit quota limits.
- `central-pet-front/src/Components/Carousel.tsx` duplicates content and uses a continuous animation loop.
- `PetsService` is single-process memory only, so horizontal scaling is not possible yet.

## Fragile Areas

- `buildRegisterFormDataFromPet()` reconstructs form state from presentation strings in `central-pet-front/src/Mocks/PetsStorage.ts`.
- That makes the edit flow sensitive to formatting changes in the display layer.
- Tests do not cover a real database-backed pet flow yet.

## Missing Critical Features

- Real persisted pet CRUD.
- Real login/session/authentication.
- A single shared pet model between UI, API, and storage.

## Test Coverage Gaps

- Invalid DTOs and HTTP-layer validation edge cases are not fully covered.
- No test proves the frontend and backend pet flows work together against the real API.
- No test currently validates Prisma-backed behavior because the feature services do not use Prisma yet.

---

_Concern audit: 2026-04-04_
- Risk: Real user data can be lost or malformed without any automated signal.
- Priority: High

**Backend modules registered without behavior:**

- What's not tested: `pet-history` and `adoption-requests` routing behavior, contracts, and future persistence expectations.
- Files: `central-pet-back/src/modules/pet-history/`, `central-pet-back/src/modules/adoption-requests/`
- Risk: Future implementation work has no regression net and can drift from intended API shape.
- Priority: Medium

---

_Concerns audit: 2026-03-27_
