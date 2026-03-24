# Structure

## Repository Layout

- `package.json` at the repo root defines workspace scripts like `dev`, `dev:front`, and lint-staged hooks.
- `pnpm-workspace.yaml` and `pnpm-lock.yaml` make this a pnpm workspace.
- `docker-compose.dev.yml` and `docker-compose.prod.yml` orchestrate the containerized runs.
- `scripts/deploy-prod.sh` is the deployment helper script.
- `docs/` contains project notes and planning docs, including `docs/planejamento-modelagem-banco.md` and `docs/gerenciador-de-pacotes.md`.
- `central-pet-prod.tar.gz` is a packaged artifact in the root.

## Frontend App

`central-pet-front/` is the main application directory. It contains the Vite app, its tests, and build config:

- `central-pet-front/package.json`
- `central-pet-front/vite.config.ts`
- `central-pet-front/tsconfig.json`
- `central-pet-front/vitest.config.ts`
- `central-pet-front/playwright.config.ts`
- `central-pet-front/index.html`
- `central-pet-front/public/`
- `central-pet-front/src/`
- `central-pet-front/tests/e2e/`

## `src/` Breakdown

- `central-pet-front/src/main.tsx` is the browser bootstrapping entry point.
- `central-pet-front/src/App.tsx` is the app shell and route composer.
- `central-pet-front/src/routes.tsx` defines route constants and path builders.
- `central-pet-front/src/index.css` and `central-pet-front/src/App.css` hold global styling.
- `central-pet-front/src/vite-env.d.ts` provides Vite type declarations.

### `src/Components/`

Shared UI lives here. The folder is split by concern:

- `central-pet-front/src/Components/Form/` contains low-level form primitives such as `FormInput.tsx`, `FormSelect.tsx`, `FormCheckbox.tsx`, and `SelectableCard.tsx`.
- `central-pet-front/src/Components/PetRegister/` contains the register flow sections and wrappers.
- `central-pet-front/src/Components/PetProfile/` contains the profile view sections.
- Standalone shared widgets live at the folder root, such as `Carousel.tsx`, `DropdownMenu.tsx`, `PetModal.tsx`, and `SidePanel.tsx`.
- Component tests are colocated as `*.test.tsx` next to the component they cover.

### `src/Pages/`

Route-level screens live here:

- `central-pet-front/src/Pages/MainPage.tsx`
- `central-pet-front/src/Pages/Pet/PetPersonalityRegisterPage.tsx`
- `central-pet-front/src/Pages/Pet/PetPersonalityProfilePage.tsx`

The nested `Pages/Pet/` folder groups pet-related screens together.

### `src/Layout/`

Persistent chrome lives here:

- `central-pet-front/src/Layout/Header.tsx`
- `central-pet-front/src/Layout/Footer.tsx`
- `central-pet-front/src/Layout/Header.css`
- `central-pet-front/src/Layout/Footer.css`

### `src/Mocks/`

This folder holds seed data and browser-storage helpers:

- `central-pet-front/src/Mocks/Pet.tsx` seeds the carousel data.
- `central-pet-front/src/Mocks/PetRegisterFormMock.ts` defines form defaults, schema, and option lists.
- `central-pet-front/src/Mocks/PetPersonalityOptions.tsx` defines behavior cards.
- `central-pet-front/src/Mocks/PetsStorage.ts` handles persistence and data conversion.

### `src/Models/`

Shared types live in `central-pet-front/src/Models/Types.ts`.

### `src/assets/`

Static assets are stored under `central-pet-front/src/assets/`, including `central-pet-front/src/assets/image/dog.png`.

## Tests And Static Files

- `central-pet-front/tests/e2e/` contains Playwright specs such as `home.spec.ts`, `pet-register.spec.ts`, and `pet-profile.spec.ts`.
- `central-pet-front/src/test/setup.ts` holds test setup for the frontend unit tests.
- `central-pet-front/public/` contains static public assets like `dog.svg` and `vite.svg`.

## Naming And Layout Conventions

- React files use `PascalCase.tsx`.
- Supporting styles use `PascalCase.css` when colocated with a component, as in `Layout/Header.css`.
- Test files mirror the component name with a `.test.tsx` suffix.
- Folder names are also PascalCase for feature groupings such as `Components/PetProfile/` and `Components/PetRegister/`.
- Imports use the `@/` alias for `central-pet-front/src/*`; Vite also defines `@@` for the repository root in `central-pet-front/vite.config.ts`.
