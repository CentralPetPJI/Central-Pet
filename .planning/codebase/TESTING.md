# Testing Patterns

**Analysis Date:** 2026-03-27

## Test Framework

**Runner:**

- Backend unit tests: Jest 30 via the inline `jest` config in `central-pet-back/package.json`
- Frontend component tests: Vitest 4.1.0 via `central-pet-front/vitest.config.ts`
- Frontend E2E tests: Playwright 1.58.2 via `central-pet-front/playwright.config.ts`

**Assertion Library:**

- Backend uses Jest `expect` from `@jest/globals`, as shown in `central-pet-back/src/modules/pets/pets.service.spec.ts`.
- Frontend component tests use Testing Library assertions extended by `@testing-library/jest-dom/vitest` from `central-pet-front/src/test/setup.ts`.
- E2E tests use Playwright's built-in `expect`, as shown in `central-pet-front/tests/e2e/home.spec.ts`.

**Run Commands:**

```bash
pnpm --filter central-pet-back test          # Run backend Jest tests
pnpm --filter central-pet-back test:watch    # Watch backend Jest tests
pnpm --filter central-pet-back test:cov      # Backend coverage
pnpm --filter central-pet-front test         # Start Vitest in watch mode
pnpm --filter central-pet-front test:run     # Run Vitest once
pnpm --filter central-pet-front test:e2e     # Run Playwright E2E tests
```

## Test File Organization

**Location:**

- Backend tests are colocated with the module under test, for example `central-pet-back/src/modules/pets/pets.service.spec.ts` and `central-pet-back/src/modules/pets/pets.controller.spec.ts`.
- Frontend component tests are colocated beside the component, for example `central-pet-front/src/Components/Carousel.test.tsx`.
- Frontend E2E tests live separately under `central-pet-front/tests/e2e/`.

**Naming:**

- Backend unit tests use `*.spec.ts`.
- Frontend unit/component tests use `*.test.tsx`.
- Frontend E2E tests use `*.spec.ts`.

**Structure:**

```text
central-pet-back/src/modules/**/**/*.spec.ts
central-pet-front/src/**/*.test.tsx
central-pet-front/tests/e2e/**/*.spec.ts
```

## Test Structure

**Suite Organization:**

```typescript
describe("PetsService", () => {
  let service: PetsService;

  beforeEach(() => {
    service = new PetsService();
  });

  it("should create a pet with provided values", () => {
    const result = service.create(makeCreateDto());

    expect(result.message).toBe("Pet created successfully");
    expect(result.data.id).toBeDefined();
  });
});
```

Source: `central-pet-back/src/modules/pets/pets.service.spec.ts`

**Patterns:**

- Backend service tests instantiate the class directly in `beforeEach` when no framework wiring is needed, as in `central-pet-back/src/modules/pets/pets.service.spec.ts`.
- Backend controller tests use `Test.createTestingModule(...).compile()` and `module.get(...)` from `@nestjs/testing`, as in `central-pet-back/src/modules/pets/pets.controller.spec.ts`.
- Frontend component tests render with Testing Library, often wrapped in `MemoryRouter` when links or routing are involved, as in `central-pet-front/src/Components/Carousel.test.tsx` and `central-pet-front/src/Components/PetModal.test.tsx`.
- Shared DOM cleanup is centralized in `central-pet-front/src/test/setup.ts` via `afterEach(cleanup)`.
- E2E tests are single-scenario files built around `test(...)` with explicit `page.goto(...)`, user actions, and role/text-based assertions, as in `central-pet-front/tests/e2e/pet-register.spec.ts`.

## Mocking

**Framework:** Jest mocking on the backend is not currently used in the existing specs. Frontend unit tests use Vitest `vi`.

**Patterns:**

```typescript
beforeEach(() => {
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn(() => 1),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});
```

Source: `central-pet-front/src/Components/Carousel.test.tsx`

**What to Mock:**

- Mock browser globals only when the component depends on DOM APIs unavailable or unstable in JSDOM, such as `requestAnimationFrame` in `central-pet-front/src/Components/Carousel.test.tsx`.
- Provide lightweight callback doubles with `vi.fn()` for prop handlers, such as the `onClick` prop in `central-pet-front/src/Components/PetModal.test.tsx`.

**What NOT to Mock:**

- Existing tests do not mock local storage helper modules, route builders, or component children. They exercise real `@/Mocks/PetsStorage` behavior transitively from rendered components such as `central-pet-front/src/App.tsx` and `central-pet-front/src/Pages/MainPage.tsx`.
- Backend service tests do not mock time, UUID generation, or exceptions; they assert on observable outputs and thrown NestJS errors in `central-pet-back/src/modules/pets/pets.service.spec.ts`.

## Fixtures and Factories

**Test Data:**

```typescript
const makeCreateDto = (): CreatePetDto => ({
  name: "Thor",
  species: "DOG",
  breed: "Labrador",
  responsibleUserId: "11111111-1111-1111-1111-111111111111",
});
```

Source: `central-pet-back/src/modules/pets/pets.service.spec.ts`

```typescript
const petStub: Pet = {
  id: 42,
  name: "Luna",
  species: "dog",
  photo: "https://example.com/luna.png",
  physicalCharacteristics: "SRD, 3 anos, Femea, porte Medio",
  behavioralCharacteristics: "Calma, sociavel",
  notes: "Contato: 11999999999",
};
```

Source: `central-pet-front/src/Components/PetModal.test.tsx`

**Location:**

- Test fixtures currently live inside each spec file rather than in shared fixture directories.
- The frontend also has reusable mock domain data under `central-pet-front/src/Mocks/`, but current tests mostly define per-spec stubs inline instead of importing shared fixtures.

## Coverage

**Requirements:** No minimum coverage threshold is enforced in the observed config files.

**View Coverage:**

```bash
pnpm --filter central-pet-back test:cov
```

- Backend coverage is enabled by `jest --coverage` and collected from `**/*.(t|j)s` into `central-pet-back/coverage` per the `jest` block in `central-pet-back/package.json`.
- No Vitest coverage configuration was detected in `central-pet-front/vitest.config.ts`.
- No Playwright coverage reporting was detected in `central-pet-front/playwright.config.ts`.

## Test Types

**Unit Tests:**

- Backend unit tests cover service behavior and controller wiring in `central-pet-back/src/modules/pets/pets.service.spec.ts` and `central-pet-back/src/modules/pets/pets.controller.spec.ts`.
- Frontend component tests verify rendered text, links, and modal behavior in `central-pet-front/src/Components/Carousel.test.tsx`, `central-pet-front/src/Components/PetModal.test.tsx`, and `central-pet-front/src/Components/SidePanel.test.tsx`.

**Integration Tests:**

- NestJS E2E support is script-configured through `test:e2e` in `central-pet-back/package.json`, but no backend E2E spec files or `test/jest-e2e.json` file were found in the repository.
- Frontend component tests act closer to shallow integration tests for router-linked UI because they render real components inside `MemoryRouter`.

**E2E Tests:**

- Playwright is the active E2E framework, configured in `central-pet-front/playwright.config.ts`.
- E2E scenarios currently cover the homepage modal flow, pet profile page, and pet registration redirect flow in `central-pet-front/tests/e2e/home.spec.ts`, `central-pet-front/tests/e2e/pet-profile.spec.ts`, and `central-pet-front/tests/e2e/pet-register.spec.ts`.

## Common Patterns

**Async Testing:**

```typescript
test("cadastro cria pet e redireciona para o perfil", async ({ page }) => {
  await page.goto("/pets/new");
  await page.getByRole("textbox", { name: "Nome" }).fill("Rex E2E");
  await page.getByRole("button", { name: "Salvar pet" }).click();

  await expect(page).toHaveURL(/\/pets\/\d+$/);
});
```

Source: `central-pet-front/tests/e2e/pet-register.spec.ts`

- Async backend setup uses `beforeEach(async () => { ... })` around Nest testing modules in `central-pet-back/src/modules/pets/pets.controller.spec.ts`.

**Error Testing:**

```typescript
it("should throw NotFoundException when pet does not exist on findOne", () => {
  expect(() => service.findOne("missing-id")).toThrow(NotFoundException);
});
```

Source: `central-pet-back/src/modules/pets/pets.service.spec.ts`

- Frontend component tests currently focus on happy-path rendering and interaction; no failing-validation or error-branch component tests were detected in `central-pet-front/src/**/*.test.tsx`.

---

_Testing analysis: 2026-03-27_
