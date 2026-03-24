# Testing Practices

## Frameworks

- Unit and component tests use `Vitest` with `@testing-library/react` and `@testing-library/jest-dom`.
- E2E tests use `@playwright/test`.
- Test runtime setup is centralized in `src/test/setup.ts`, which imports Testing Library matchers and cleans up DOM state after each test.

## Test Layout

- Unit/component tests live beside the source they cover, for example `src/Components/Carousel.test.tsx`, `src/Components/SidePanel.test.tsx`, and `src/Components/PetModal.test.tsx`.
- E2E tests live separately under `tests/e2e/`, with one spec per user journey such as `home.spec.ts`, `pet-profile.spec.ts`, and `pet-register.spec.ts`.
- `vitest.config.ts` includes only `src/**/*.test.{ts,tsx}` and explicitly excludes `tests/e2e/**`.
- Playwright is pointed at `tests/e2e/` through `playwright.config.ts`.

## Commands

- `pnpm test` starts Vitest in watch mode.
- `pnpm test:run` runs Vitest once.
- `pnpm test:ui` opens the Vitest UI.
- `pnpm test:e2e` runs the Playwright suite.
- `pnpm test:e2e:ui` opens the Playwright UI runner.

## Test Style And Mocks

- Component tests use small inline stubs instead of shared fixture factories, as seen in `src/Components/Carousel.test.tsx` and `src/Components/PetModal.test.tsx`.
- `vi.stubGlobal()` is used to replace browser APIs such as `requestAnimationFrame` and `cancelAnimationFrame` in `Carousel.test.tsx`.
- `MemoryRouter` wraps router-dependent components in unit tests.
- E2E tests hit the running app directly and assert on visible headings, links, and navigation outcomes rather than internal state.
- There are no network-layer mocks because the current app persists to `localStorage` and does not appear to call a remote API.

## Coverage And Gaps

- Existing coverage focuses on smoke tests for rendering, routing, modal launch, and the pet registration flow.
- There is no direct test coverage for the storage helpers in `src/Mocks/PetsStorage.ts`, the Zod validation schema in `src/Mocks/PetRegisterFormMock.ts`, or the route helper logic in `src/routes.tsx`.
- No explicit tests cover failure states such as malformed `localStorage`, file upload errors, empty profile fallbacks, or invalid route parameters.
- The current suite is useful for core journeys, but it still leaves a gap around regression tests for validation and persistence logic.
