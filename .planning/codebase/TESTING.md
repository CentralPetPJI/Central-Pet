# Testing Patterns

**Analysis Date:** 2026-04-04

## Test Runners

- Backend unit/e2e tests use Jest in `central-pet-back/package.json` and `central-pet-back/test/jest-e2e.json`.
- Frontend component tests use Vitest in `central-pet-front/package.json` and `central-pet-front/vitest.config.ts`.
- Browser E2E tests live in the separate `tests/` workspace and use Playwright.

## Run Commands

```bash
pnpm --filter central-pet-back test
pnpm --filter central-pet-back test:cov
pnpm --filter central-pet-front test:run
pnpm --filter central-pet-front test
pnpm test:e2e
pnpm --filter tests test:ui
```

## Test Layout

- Backend unit specs sit next to source in `central-pet-back/src/modules/**/*.spec.ts`.
- Backend e2e specs live in `central-pet-back/test/`.
- Frontend component tests sit next to source in `central-pet-front/src/**/*.test.tsx`.
- Playwright scenarios live in `tests/e2e/*.spec.ts`.

## What the Tests Cover

- `central-pet-back/src/modules/pets/pets.service.spec.ts` covers pet CRUD and validation rules.
- `central-pet-back/src/modules/mock-auth/mock-auth.service.spec.ts` covers mock auth behavior.
- `central-pet-back/src/modules/adoption-requests/adoption-requests.service.spec.ts` covers the seeded request view.
- `central-pet-front/src/Components/*.test.tsx` cover modal, carousel, side panel, and mock-user UI behavior.
- `tests/e2e/` covers the homepage, pet profile, registration flow, and ownership workflow.

## Common Patterns

- Backend service tests often instantiate the class directly.
- Backend controller tests use `@nestjs/testing` when module wiring matters.
- Frontend tests use Testing Library and often wrap rendered components in `MemoryRouter`.
- Shared DOM cleanup is handled in `central-pet-front/src/test/setup.ts`.
- Playwright config launches the backend and frontend automatically before tests start.

## Mocking

- Frontend tests use `vi.mock()` for `api` and auth hooks when a page needs controlled network/auth state.
- `vi.stubGlobal()` is used for browser APIs like `requestAnimationFrame` when needed.
- Backend tests assert against returned envelopes and Nest exceptions rather than mocking every dependency.

## Coverage and Gaps

- `central-pet-back` has coverage support through `test:cov`.
- No frontend coverage command is configured.
- The most important missing coverage is end-to-end behavior that exercises the real API and database, since much of the app still falls back to mock/local data.

## Fixture Style

- Fixtures are mostly inline inside each spec file.
- The frontend also has reusable mock data in `central-pet-front/src/Mocks/`, but tests usually keep small stubs local to the spec.

---

_Testing analysis: 2026-04-04_

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
