# Codebase Concerns

**Analysis Date:** 2026-03-27

## Tech Debt

**Frontend/backend data model split:**

- Issue: The frontend persists pets with browser-only mock structures while the backend exposes a different DTO and identifier model. `central-pet-front/src/Models/Types.ts` uses numeric `id` values and freeform strings like `species: 'dog' | 'cat'`, while `central-pet-back/src/modules/pets/dto/create-pet.dto.ts` requires UUID-backed `responsibleUserId` and uppercase enums such as `DOG` and `CAT`.
- Files: `central-pet-front/src/Models/Types.ts`, `central-pet-front/src/Mocks/PetsStorage.ts`, `central-pet-front/src/Mocks/PetRegisterFormMock.ts`, `central-pet-back/src/modules/pets/dto/create-pet.dto.ts`, `central-pet-back/src/modules/pets/dto/update-pet.dto.ts`
- Impact: UI work can progress without surfacing API contract breaks, then fail during integration. A future API migration will require translation logic across IDs, enums, age fields, health fields, and pet ownership data.
- Fix approach: Define a single pet contract around backend DTOs and database models, then replace `localStorage` mocks in `central-pet-front/src/Mocks/` with an API client layer.

**Persistence layer is scaffolded but not used:**

- Issue: Prisma is initialized globally, but `PetsService` stores all pets in a process-local array and the Prisma schema has no models or migrations.
- Files: `central-pet-back/src/prisma/prisma.service.ts`, `central-pet-back/src/modules/pets/pets.service.ts`, `central-pet-back/prisma/schema.prisma`, `central-pet-back/prisma.config.ts`
- Impact: Application restarts erase all backend pet records, horizontal scaling is impossible, and there is no real source of truth despite a database dependency being required at boot.
- Fix approach: Add Prisma models and migrations under `central-pet-back/prisma/`, inject `PrismaService` into `central-pet-back/src/modules/pets/pets.service.ts`, and remove the in-memory array.

**Placeholder modules shipped as real features:**

- Issue: `PetHistory` and `AdoptionRequests` modules are registered in `AppModule`, but their controllers and services are empty shells.
- Files: `central-pet-back/src/app.module.ts`, `central-pet-back/src/modules/pet-history/pet-history.controller.ts`, `central-pet-back/src/modules/pet-history/pet-history.service.ts`, `central-pet-back/src/modules/adoption-requests/adoption-requests.controller.ts`, `central-pet-back/src/modules/adoption-requests/adoption-requests.service.ts`
- Impact: The codebase implies feature completeness that does not exist, which increases planning confusion and creates dead architectural branches.
- Fix approach: Either implement those modules end-to-end or remove them from `central-pet-back/src/app.module.ts` until they have actual endpoints, storage, and tests.

**Demo data is embedded into production code paths:**

- Issue: Initial registration and profile states are prefilled from static mock data instead of empty defaults, and profile pages fall back to reconstructed mock records.
- Files: `central-pet-front/src/Mocks/PetRegisterFormMock.ts`, `central-pet-front/src/Pages/Pet/PetPersonalityProfilePage.tsx`, `central-pet-front/src/Components/PetProfile/PetProfileOverview.tsx`
- Impact: Users can accidentally submit placeholder content, and future API adoption becomes harder because screens are normalized around demo assumptions.
- Fix approach: Replace demo defaults with empty form state and move sample data behind explicit development-only fixtures.

## Known Bugs

**Backend pet records disappear after restart:**

- Symptoms: Pets created through `POST /pets` only exist until the Nest process restarts.
- Files: `central-pet-back/src/modules/pets/pets.service.ts`
- Trigger: Restart the backend container or process after creating records.
- Workaround: None in the backend. The frontend only avoids the symptom because it does not consume this API.

**Frontend and backend pet flows are disconnected:**

- Symptoms: A pet created in the UI does not exist in the backend API, and backend-created pets do not appear in the UI.
- Files: `central-pet-front/src/App.tsx`, `central-pet-front/src/Pages/MainPage.tsx`, `central-pet-front/src/Components/PetRegister/PetRegisterForm.tsx`, `central-pet-front/src/Mocks/PetsStorage.ts`, `central-pet-back/src/modules/pets/pets.controller.ts`
- Trigger: Use the frontend pet registration/profile flow and inspect backend `GET /api/pets`, or create data through the API and open the UI.
- Workaround: None. The repo currently has two separate pet systems.

**Carousel looping breaks drag continuity at the boundary:**

- Symptoms: Dragging left across the loop boundary causes a visible jump because the scroll position is normalized back into the first half of the container.
- Files: `central-pet-front/src/Components/Carousel.tsx`
- Trigger: Drag the carousel left until `scrollLeft <= 0`.
- Workaround: Avoid dragging through the boundary; rely on the rightward auto-scroll.

## Security Considerations

**No authentication or authorization on mutating pet endpoints:**

- Risk: Any client that can reach the backend can create or update pets, and can set `responsibleUserId` directly in the request body.
- Files: `central-pet-back/src/modules/pets/pets.controller.ts`, `central-pet-back/src/modules/pets/dto/create-pet.dto.ts`, `central-pet-back/src/modules/pets/dto/update-pet.dto.ts`, `central-pet-back/package.json`
- Current mitigation: Input validation exists through `ValidationPipe` and `class-validator`, but there are no guards, sessions, JWT checks, or ownership enforcement.
- Recommendations: Add an auth module, derive actor identity from the authenticated request, and remove client authority over `responsibleUserId`.

**Database credentials can be baked into backend image layers:**

- Risk: The production build passes `DATABASE_URL` as a Docker build arg and promotes it to an image `ENV`, which can expose connection strings through image history, registry metadata, or build logs.
- Files: `central-pet-back/Dockerfile`, `docker-compose.prod.yml`
- Current mitigation: Runtime also injects `DATABASE_URL`, so the app can boot without reading secrets from source files.
- Recommendations: Stop using `ARG DATABASE_URL` for image builds; use the placeholder URL in `central-pet-back/prisma.config.ts` for generate/build steps and inject the real secret only at runtime.

**Development database credentials are hardcoded in compose and examples:**

- Risk: Local credentials are committed in plaintext, which encourages secret reuse and weakens the boundary between dev and prod operational practices.
- Files: `docker-compose.dev.yml`, `central-pet-back/.env.example`
- Current mitigation: Production compose requires environment substitution instead of literal values.
- Recommendations: Move even development credentials into local `.env` files and document that example values must never be reused outside isolated local environments.

**Missing common HTTP hardening middleware:**

- Risk: There is no evidence of security headers, rate limiting, or request-throttling middleware on the backend.
- Files: `central-pet-back/src/main.ts`, `central-pet-back/package.json`
- Current mitigation: CORS is restricted to a single origin value and DTO validation is enabled.
- Recommendations: Add `helmet`, request throttling, and explicit production logging/redaction rules in `central-pet-back/src/main.ts`.

## Performance Bottlenecks

**Image uploads are stored as base64 blobs in `localStorage`:**

- Problem: `FileReader.readAsDataURL()` stores profile and gallery images directly in browser storage, and those values are then duplicated across pet summary and profile records.
- Files: `central-pet-front/src/Components/PetRegister/PetRegisterForm.tsx`, `central-pet-front/src/Mocks/PetsStorage.ts`
- Cause: The app has no file storage service, so images are serialized into strings and persisted in `localStorage`.
- Improvement path: Upload files to backend/object storage, keep only URLs in browser state, and cap client-side preview size before upload.

**Carousel cost scales linearly with duplicated DOM and continuous animation:**

- Problem: The carousel doubles the pet list in memory/DOM and runs an unthrottled `requestAnimationFrame` loop for the entire visible lifetime of the page.
- Files: `central-pet-front/src/Components/Carousel.tsx`
- Cause: Infinite scrolling is implemented by duplicating all cards and continuously mutating `scrollLeft`.
- Improvement path: Replace duplication with a windowed carousel strategy, pause animation when offscreen, and move boundary logic to a more stable snapping approach.

**Repeated synchronous `localStorage` reads happen during render paths:**

- Problem: Components call `getStoredPets()` multiple times during render and derive state from JSON-parsed browser storage synchronously.
- Files: `central-pet-front/src/App.tsx`, `central-pet-front/src/Pages/MainPage.tsx`, `central-pet-front/src/Components/PetRegister/PetRegisterForm.tsx`, `central-pet-front/src/Mocks/PetsStorage.ts`
- Cause: Persistent state is read directly inside component execution instead of being loaded once into a state/store layer.
- Improvement path: Centralize pet state in a React store or loader, memoize derived values, and keep storage I/O outside render bodies.

## Fragile Areas

**Pet registration/profile flow depends on lossy string parsing:**

- Files: `central-pet-front/src/Mocks/PetsStorage.ts`, `central-pet-front/src/Pages/Pet/PetPersonalityProfilePage.tsx`
- Why fragile: `buildRegisterFormDataFromPet()` reconstructs structured form state by splitting `physicalCharacteristics` strings. Format changes in one screen can silently corrupt edit behavior in another.
- Safe modification: Introduce a typed domain model for pet profiles and stop deriving editable fields from presentation strings.
- Test coverage: No tests exercise edit-mode reconstruction from stored pets.

**Backend startup depends on database config even when routes do not use the database:**

- Files: `central-pet-back/src/app.module.ts`, `central-pet-back/src/prisma/prisma.service.ts`, `central-pet-back/test/app.e2e-spec.ts`
- Why fragile: `PrismaService` throws immediately if `DATABASE_URL` is missing, even though the implemented pet feature is still in-memory. Tests already need provider overrides to avoid the real dependency.
- Safe modification: Make Prisma initialization conditional until persistence is actually required, or finish the migration so the dependency is justified.
- Test coverage: Only `central-pet-back/test/app.e2e-spec.ts` covers a mocked health path; there is no end-to-end test with a real database.

**Tests cover mock flows, not integration boundaries:**

- Files: `central-pet-front/tests/e2e/pet-register.spec.ts`, `central-pet-front/tests/e2e/pet-profile.spec.ts`, `central-pet-back/src/modules/pets/pets.service.spec.ts`, `.github/workflows/issue_rewrite.yml`
- Why fragile: Passing tests only prove that mock-backed UI flows and the in-memory service work in isolation. There is no CI workflow running application tests on push or pull request.
- Safe modification: Add CI jobs under `.github/workflows/` for frontend and backend tests, then add API integration coverage for the pet flow before replacing mocks.
- Test coverage: No automated check currently validates frontend/backend interoperability.

## Scaling Limits

**Backend pet storage capacity is bounded by single-process memory:**

- Current capacity: Limited to the memory available to one Nest process; records are stored in `private readonly pets: PetRecord[] = [];`.
- Limit: Records vanish on restart and cannot be shared across replicas or containers.
- Scaling path: Move pets to PostgreSQL through Prisma and paginate `GET /pets`.

**Browser persistence is bounded by per-origin storage quotas:**

- Current capacity: Limited by browser `localStorage` quotas, typically a few megabytes, while images are stored as large base64 strings.
- Limit: Larger photo sets or multiple pets can exceed quota and cause saves to fail unpredictably.
- Scaling path: Shift binary assets to server-side storage and keep client persistence limited to lightweight drafts.

## Dependencies at Risk

**Generated Prisma client output is an undeclared build dependency:**

- Risk: `PrismaService` imports `../../generated/prisma/client`, but the generated directory is not source-controlled and only exists after generation succeeds.
- Impact: Fresh environments, editors, and CI jobs can fail if `prisma generate` has not run or if generated output drifts from source.
- Migration plan: Standardize generation in CI and development bootstrap, or switch to the default generated client path to reduce custom output coupling.

## Missing Critical Features

**Real pet data integration:**

- Problem: The primary pet journey is not connected to the backend or database.
- Blocks: Reliable adoption listings, shared multi-user data, and any production-ready CRUD behavior.

**Access control and identity:**

- Problem: There is no implemented login, session, or authorization layer despite routes and DTOs implying user ownership.
- Blocks: Safe write operations, auditability, and role-based moderation/admin flows.

## Test Coverage Gaps

**DTO validation and API error handling:**

- What's not tested: Invalid payload rejection, whitelist enforcement, enum validation, and update edge cases at the HTTP layer.
- Files: `central-pet-back/src/main.ts`, `central-pet-back/src/modules/pets/dto/create-pet.dto.ts`, `central-pet-back/src/modules/pets/dto/update-pet.dto.ts`, `central-pet-back/src/modules/pets/pets.controller.ts`
- Risk: Requests can fail differently in controllers than in service unit tests, and validation regressions may ship unnoticed.
- Priority: High

**Frontend form persistence and storage-failure behavior:**

- What's not tested: `localStorage` corruption recovery, quota failures, image serialization, and edit-mode hydration from saved profiles.
- Files: `central-pet-front/src/Components/PetRegister/PetRegisterForm.tsx`, `central-pet-front/src/Mocks/PetsStorage.ts`
- Risk: Real user data can be lost or malformed without any automated signal.
- Priority: High

**Backend modules registered without behavior:**

- What's not tested: `pet-history` and `adoption-requests` routing behavior, contracts, and future persistence expectations.
- Files: `central-pet-back/src/modules/pet-history/`, `central-pet-back/src/modules/adoption-requests/`
- Risk: Future implementation work has no regression net and can drift from intended API shape.
- Priority: Medium

---

_Concerns audit: 2026-03-27_
