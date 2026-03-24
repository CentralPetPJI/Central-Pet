# Code Conventions

## Naming And Layout

- The frontend lives in `central-pet-front/`, with feature folders under `src/` such as `src/Components/`, `src/Pages/`, `src/Layout/`, `src/Models/`, and `src/Mocks/`.
- React component files use PascalCase names like `src/Components/Carousel.tsx`, `src/Components/PetRegister/PetRegisterForm.tsx`, and `src/Pages/Pet/PetPersonalityProfilePage.tsx`.
- Shared form helpers are grouped under `src/Components/Form/`, and page-specific building blocks are grouped under nested folders like `src/Components/PetProfile/` and `src/Components/PetRegister/`.
- Route definitions are centralized in `src/routes.tsx`, with nested objects like `routes.pets.new` and `routes.pets.detail`.

## Type Discipline

- TypeScript is configured in strict mode in `central-pet-front/tsconfig.json`, with `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch` enabled.
- Components and data structures are typed explicitly with `interface` and `type`, for example `Pet`, `Photo`, `PetRegisterFormData`, `FormErrors`, and `AppRoute`.
- Route objects use `satisfies` to keep literal route shapes while preserving type safety, and dynamic routes expose a `build()` helper for path generation.
- Runtime guards are used where persistence is untrusted. `src/Mocks/PetsStorage.ts` validates `localStorage` content before using it.
- Zod is used for form validation in `src/Mocks/PetRegisterFormMock.ts`, with `safeParse()` used before save.

## Component Patterns

- Most UI is written as small, focused function components with props passed down from page containers.
- The codebase mixes `React.FC` and plain function declarations. Both patterns exist in the same tree, but props are always typed.
- Form UI is decomposed into reusable pieces like `FormField`, `FormInput`, `FormSelect`, `FormCheckbox`, `FieldError`, and `FormSection`.
- Page components generally orchestrate data and compose presentational children instead of containing markup inline, as seen in `src/Pages/Pet/PetPersonalityRegisterPage.tsx` and `src/Components/PetRegister/PetRegisterForm.tsx`.
- Styling is utility-first with Tailwind classes embedded directly in JSX. Shared visual structure is handled by component composition rather than CSS modules.

## State And Data Handling

- State is mostly local and client-side. `src/Components/PetRegister/PetRegisterForm.tsx` uses `useState` for form data, validation errors, selected personalities, and save messages.
- Persistence is handled through `window.localStorage` keys such as `central-pet:pets`, `central-pet:pet-profiles`, `central-pet:register-form`, and `central-pet:pet-personality`.
- Derived values are computed in render or in helper functions, such as species counts in `src/App.tsx` and profile reconstruction in `src/Pages/Pet/PetPersonalityProfilePage.tsx`.
- Navigation is router-driven with `react-router-dom`; form save flows redirect after persistence, and the register page remounts by changing a `key` in `src/Pages/Pet/PetPersonalityRegisterPage.tsx`.

## Error Handling

- Validation errors are surfaced field-by-field from Zod issues in `src/Components/PetRegister/PetRegisterForm.tsx`.
- Storage parsing is defensive: invalid JSON or malformed records are removed from `localStorage` and replaced with defaults in `src/Mocks/PetsStorage.ts`.
- File upload failures are explicitly rejected in `readFilesAsDataUrls()` with a thrown `Error`, and empty file inputs are treated as no-op.
- Global lint rules in `central-pet-front/eslint.config.js` reject `console` and `debugger`, which keeps runtime debugging out of committed code.

## Repository Hygiene

- The frontend package is isolated in `central-pet-front/` with its own `package.json`, `vite` config, ESLint config, and TypeScript config.
- Path aliases are standardized with `@/*` in `central-pet-front/tsconfig.json` and mirrored in `vitest.config.ts`; an additional `@@` alias points to the repo root for tests.
- Formatting is standardized with Prettier via `central-pet-front/.prettierrc`.
- `central-pet-front/package.json` exposes dedicated scripts for linting, formatting, unit tests, and Playwright e2e runs.
- A few files contain TODO comments, mostly about UI cleanup and future backend-backed data, which suggests the repo is still in active iteration.
