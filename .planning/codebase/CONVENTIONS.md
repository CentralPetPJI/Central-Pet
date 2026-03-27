# Coding Conventions

**Analysis Date:** 2026-03-27

## Naming Patterns

**Files:**

- Backend NestJS files use kebab-case plus role suffixes such as `central-pet-back/src/modules/pets/pets.service.ts`, `central-pet-back/src/modules/pets/pets.controller.ts`, and `central-pet-back/src/modules/pets/dto/create-pet.dto.ts`.
- Frontend React component and page files use PascalCase such as `central-pet-front/src/Components/Carousel.tsx`, `central-pet-front/src/Components/PetRegister/PetRegisterForm.tsx`, and `central-pet-front/src/Pages/Pet/PetPersonalityProfilePage.tsx`.
- Frontend test files are colocated and mirror the component name with `.test.tsx`, for example `central-pet-front/src/Components/PetModal.test.tsx`.
- Playwright E2E tests use lower-kebab names with `.spec.ts`, for example `central-pet-front/tests/e2e/pet-register.spec.ts`.

**Functions:**

- Component functions and exported helpers use camelCase, for example `getInitialRegisterPageState`, `handleSavePet`, `buildPetFromRegisterForm`, and `getStoredPets` in `central-pet-front/src/Components/PetRegister/PetRegisterForm.tsx` and `central-pet-front/src/Mocks/PetsStorage.ts`.
- NestJS controller methods use terse CRUD-style camelCase names such as `create`, `findAll`, `findOne`, and `update` in `central-pet-back/src/modules/pets/pets.controller.ts`.
- Test helper factories use `make...` naming, for example `makeCreateDto` in `central-pet-back/src/modules/pets/pets.service.spec.ts`.

**Variables:**

- Local state and variables use camelCase throughout, for example `selectedPet` in `central-pet-front/src/Components/Carousel.tsx`, `speciesCounts` in `central-pet-front/src/App.tsx`, and `connectionString` in `central-pet-back/src/prisma/prisma.service.ts`.
- Constant identifiers use UPPER_SNAKE_CASE only for values treated as fixed configuration, for example `AUTO_SCROLL_PX_PER_SECOND` in `central-pet-front/src/Components/Carousel.tsx`.
- Storage keys use lower camelCase variable names pointing to colon-delimited string constants, for example `petRegisterStorageKey`, `petsStorageKey`, and `petProfilesStorageKey` in `central-pet-front/src/Mocks/PetRegisterFormMock.ts` and `central-pet-front/src/Mocks/PetsStorage.ts`.

**Types:**

- Type aliases and interfaces use PascalCase, for example `PetRecord` in `central-pet-back/src/modules/pets/pets.service.ts`, `PetRegisterFormData` in `central-pet-front/src/Mocks/PetRegisterFormMock.ts`, and `DynamicAppRoute` in `central-pet-front/src/routes.tsx`.
- Props interfaces are named with a component suffix, for example `PetModalProps`, `FieldErrorProps`, and `PetRegisterFormProps` in `central-pet-front/src/Components/PetModal.tsx`, `central-pet-front/src/Components/Form/FieldError.tsx`, and `central-pet-front/src/Components/PetRegister/PetRegisterForm.tsx`.
- Backend DTO classes are named with `Dto` suffixes, for example `CreatePetDto` and `UpdatePetDto` in `central-pet-back/src/modules/pets/dto/`.

## Code Style

**Formatting:**

- Prettier is the formatter in both packages, configured in `central-pet-back/.prettierrc` and `central-pet-front/.prettierrc`.
- Use single quotes and trailing commas everywhere. Frontend also enforces `semi: true`, `tabWidth: 2`, `printWidth: 100`, and `endOfLine: "lf"` in `central-pet-front/.prettierrc`.
- Root `lint-staged` applies `prettier --write` and `eslint --fix` to `*.{js,jsx,ts,tsx}` before commit in `package.json`.

**Linting:**

- Backend ESLint is type-aware via `typescript-eslint` `recommendedTypeChecked` in `central-pet-back/eslint.config.mjs`.
- Backend allows some unsafe TypeScript edges as warnings, not errors: `@typescript-eslint/no-explicit-any`, `@typescript-eslint/no-floating-promises`, and `@typescript-eslint/no-unsafe-argument` are all `warn` in `central-pet-back/eslint.config.mjs`.
- Frontend ESLint extends `@eslint/js`, `typescript-eslint`, `react-hooks`, and `react-refresh` in `central-pet-front/eslint.config.js`.
- Frontend disallows `console` and `debugger` entirely via `no-console: 'error'` and `no-debugger: 'error'` in `central-pet-front/eslint.config.js`.
- Frontend intentionally permits underscore-prefixed unused parameters and variables via `@typescript-eslint/no-unused-vars` ignore patterns in `central-pet-front/eslint.config.js`.

## Import Organization

**Order:**

1. External packages first, for example React, router, NestJS, or Vitest imports in `central-pet-front/src/App.tsx` and `central-pet-back/src/main.ts`.
2. Internal alias imports next on the frontend, for example `@/Components/...`, `@/Mocks/...`, and `@/routes` in `central-pet-front/src/Components/PetRegister/PetRegisterForm.tsx`.
3. Relative imports last for nearby files, for example `./dto/create-pet.dto` in `central-pet-back/src/modules/pets/pets.service.ts` and `../Models/Types` in `central-pet-front/src/Components/Carousel.tsx`.

**Path Aliases:**

- Frontend uses the `@/*` alias mapped to `./src/*` in `central-pet-front/tsconfig.json`.
- The Vitest config also defines `@` to `./src` and `@@` to the repo root in `central-pet-front/vitest.config.ts`.
- Backend does not define app-level source aliases in `central-pet-back/tsconfig.json`; imports stay relative, such as `../../generated/prisma/client` in `central-pet-back/src/prisma/prisma.service.ts`.

## Error Handling

**Patterns:**

- Backend domain errors are surfaced with NestJS exceptions, for example `NotFoundException` in `central-pet-back/src/modules/pets/pets.service.ts`.
- Backend bootstrap and infrastructure code fail fast with plain `Error` when required environment is missing, for example `DATABASE_URL is not defined` in `central-pet-back/src/prisma/prisma.service.ts`.
- Backend input validation is delegated to DTO decorators and a global `ValidationPipe` configured with `whitelist`, `transform`, and `forbidNonWhitelisted` in `central-pet-back/src/main.ts`.
- Frontend storage parsing uses defensive `try/catch` blocks and silently recovers by clearing invalid `localStorage` entries in `central-pet-front/src/Mocks/PetsStorage.ts`.
- Frontend form validation uses Zod `safeParse` and converts `issues` into a `FormErrors` map instead of throwing, as shown in `central-pet-front/src/Components/PetRegister/PetRegisterForm.tsx`.
- Frontend render-level guards prefer early returns such as `if (!message) { return null; }` in `central-pet-front/src/Components/Form/FieldError.tsx` and `if (!photo) { return; }` in `central-pet-front/src/Components/PetRegister/PetRegisterForm.tsx`.

## Logging

**Framework:** NestJS `Logger` on the backend; no application logging in frontend source.

**Patterns:**

- Backend startup uses `new Logger('Bootstrap')` and logs once after the server binds in `central-pet-back/src/main.ts`.
- Frontend source follows the lint rule that forbids `console.*`; no runtime `console` calls were detected under `central-pet-front/src`.
- No shared logging wrapper or telemetry abstraction is present in either `central-pet-back/src` or `central-pet-front/src`.

## Comments

**When to Comment:**

- Comments are sparse and usually explain non-obvious UX or state logic rather than routine JSX or service code.
- Inline explanatory comments appear around animation and drag behavior in `central-pet-front/src/Components/Carousel.tsx`.
- TODO comments are kept next to areas with known product or cleanup debt, for example `central-pet-front/src/App.tsx`, `central-pet-front/src/Pages/Pet/PetPersonalityProfilePage.tsx`, and `central-pet-front/src/Components/PetRegister/PetRegisterHealthSection.tsx`.
- Lint suppressions are localized to the exact line that needs them, for example the `eslint-disable-next-line @typescript-eslint/no-unsafe-call` comments in `central-pet-back/src/prisma/prisma.service.ts`.

**JSDoc/TSDoc:**

- Not used. No JSDoc or TSDoc blocks were detected in the sampled backend or frontend source files.

## Function Design

**Size:** Use small controllers and utility functions, but allow larger stateful React components when they coordinate multiple sections. `central-pet-back/src/modules/pets/pets.controller.ts` is thin, while `central-pet-front/src/Components/PetRegister/PetRegisterForm.tsx` centralizes form orchestration.

**Parameters:** Prefer strongly typed DTOs, props, and generic helper signatures:

- DTO parameters in controllers, for example `create(@Body() createPetDto: CreatePetDto)` in `central-pet-back/src/modules/pets/pets.controller.ts`
- Generic field updaters in React, for example `updateField = <K extends keyof PetRegisterFormData>(...)` in `central-pet-front/src/Components/PetRegister/PetRegisterForm.tsx`
- Narrow type predicates such as `isPetLike` and `isPetProfileRecordLike` in `central-pet-front/src/Mocks/PetsStorage.ts`

**Return Values:**

- Backend service methods return object envelopes with `message` and `data`, as shown in all methods in `central-pet-back/src/modules/pets/pets.service.ts`.
- Frontend helpers return normalized domain data or `undefined` for lookup misses, for example `getPetById` and `getPetProfileById` in `central-pet-front/src/Mocks/PetsStorage.ts`.
- React components usually return JSX directly; conditional no-op states return `null`, for example `central-pet-front/src/Components/Form/FieldError.tsx`.

## Module Design

**Exports:** Default exports are used for React components and many page modules, for example `central-pet-front/src/App.tsx`, `central-pet-front/src/Pages/MainPage.tsx`, and `central-pet-front/src/Components/Form/FormInput.tsx`. Named exports are used for shared values, types, and helper functions, for example `routes` in `central-pet-front/src/routes.tsx` and helper functions in `central-pet-front/src/Mocks/PetsStorage.ts`.

**Barrel Files:** Not used. Imports target concrete files directly, such as `@/Components/PetRegister/PetRegisterActions` and `./dto/update-pet.dto`, and there are no `index.ts` barrel files under `central-pet-front/src` or `central-pet-back/src`.

---

_Convention analysis: 2026-03-27_
