# Codebase Structure

**Analysis Date:** 2026-03-27

## Directory Layout

```text
Central-Pet/
├── central-pet-front/     # React + Vite frontend application
├── central-pet-back/      # NestJS backend API application
├── .planning/codebase/    # Generated codebase mapping documents
├── .github/workflows/     # CI/workflow definitions
├── docker-compose.dev.yml # Local multi-service orchestration
├── docker-compose.prod.yml# Production-oriented orchestration
└── README.md              # Repository-level project overview
```

## Directory Purposes

**`central-pet-front/`:**

- Purpose: Hold the entire browser application.
- Contains: Vite config, frontend package manifest, React source under `central-pet-front/src/`, tests under `central-pet-front/tests/` and `central-pet-front/src/test/`, static assets under `central-pet-front/public/`
- Key files: `central-pet-front/package.json`, `central-pet-front/vite.config.ts`, `central-pet-front/src/main.tsx`, `central-pet-front/src/App.tsx`

**`central-pet-front/src/`:**

- Purpose: Keep all authored frontend source code.
- Contains: Application bootstrap, routes, pages, layout, feature components, model types, mock/local-storage adapters, CSS, and assets
- Key files: `central-pet-front/src/routes.tsx`, `central-pet-front/src/Pages/MainPage.tsx`, `central-pet-front/src/Components/PetRegister/PetRegisterForm.tsx`, `central-pet-front/src/Mocks/PetsStorage.ts`

**`central-pet-front/src/Components/`:**

- Purpose: Store reusable UI building blocks and feature sections.
- Contains: Shared components such as `central-pet-front/src/Components/Carousel.tsx` and vertical feature groups like `central-pet-front/src/Components/PetProfile/` and `central-pet-front/src/Components/PetRegister/`
- Key files: `central-pet-front/src/Components/SidePanel.tsx`, `central-pet-front/src/Components/PetModal.tsx`, `central-pet-front/src/Components/Form/FormInput.tsx`

**`central-pet-front/src/Pages/`:**

- Purpose: Store route-level screens that compose components into a full page.
- Contains: Top-level pages and nested pet pages
- Key files: `central-pet-front/src/Pages/MainPage.tsx`, `central-pet-front/src/Pages/Pet/PetPersonalityRegisterPage.tsx`, `central-pet-front/src/Pages/Pet/PetPersonalityProfilePage.tsx`

**`central-pet-front/src/Layout/`:**

- Purpose: Hold shared application chrome separate from page content.
- Contains: Header/footer components and related CSS
- Key files: `central-pet-front/src/Layout/Header.tsx`, `central-pet-front/src/Layout/Footer.tsx`, `central-pet-front/src/Layout/Header.css`

**`central-pet-front/src/Mocks/`:**

- Purpose: Centralize seed data, browser persistence, and schema-backed frontend-only data helpers.
- Contains: Static pet data, form defaults, personality options, local storage accessors
- Key files: `central-pet-front/src/Mocks/Pet.tsx`, `central-pet-front/src/Mocks/PetsStorage.ts`, `central-pet-front/src/Mocks/PetRegisterFormMock.ts`

**`central-pet-front/src/Models/`:**

- Purpose: Define shared frontend TypeScript interfaces.
- Contains: UI-facing domain types
- Key files: `central-pet-front/src/Models/Types.ts`

**`central-pet-back/`:**

- Purpose: Hold the API server, Prisma schema, and generated backend artifacts.
- Contains: NestJS source under `central-pet-back/src/`, Prisma schema under `central-pet-back/prisma/`, generated client under `central-pet-back/generated/`, test config under `central-pet-back/test/`
- Key files: `central-pet-back/package.json`, `central-pet-back/src/main.ts`, `central-pet-back/src/app.module.ts`, `central-pet-back/prisma/schema.prisma`

**`central-pet-back/src/`:**

- Purpose: Keep all hand-written backend code.
- Contains: Root Nest module/app files, feature modules, Prisma provider, shared backend types
- Key files: `central-pet-back/src/main.ts`, `central-pet-back/src/app.module.ts`, `central-pet-back/src/prisma/prisma.service.ts`

**`central-pet-back/src/modules/`:**

- Purpose: Group backend features by domain area.
- Contains: One folder per feature, typically with `*.module.ts`, `*.controller.ts`, `*.service.ts`, and optional `dto/`
- Key files: `central-pet-back/src/modules/pets/pets.module.ts`, `central-pet-back/src/modules/pets/pets.controller.ts`, `central-pet-back/src/modules/pets/pets.service.ts`

**`central-pet-back/src/prisma/`:**

- Purpose: Hold hand-written Nest integration for Prisma.
- Contains: Global Prisma module/service
- Key files: `central-pet-back/src/prisma/prisma.module.ts`, `central-pet-back/src/prisma/prisma.service.ts`

**`central-pet-back/prisma/`:**

- Purpose: Hold Prisma schema source files.
- Contains: Schema configuration for database client generation
- Key files: `central-pet-back/prisma/schema.prisma`

**`central-pet-back/generated/`:**

- Purpose: Store generated Prisma client output.
- Contains: Client code emitted by `prisma generate`
- Key files: `central-pet-back/generated/prisma/client.ts`

**`.planning/codebase/`:**

- Purpose: Store generated mapping/reference documents for later planning and execution phases.
- Contains: Markdown documentation such as `ARCHITECTURE.md`, `STRUCTURE.md`, and other mapper outputs
- Key files: `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md`

## Key File Locations

**Entry Points:**

- `central-pet-front/src/main.tsx`: Frontend React bootstrap.
- `central-pet-front/src/App.tsx`: Frontend shell and route resolver.
- `central-pet-back/src/main.ts`: Backend Nest bootstrap.
- `central-pet-back/src/app.module.ts`: Backend dependency graph root.

**Configuration:**

- `central-pet-front/package.json`: Frontend scripts and dependencies.
- `central-pet-front/tsconfig.json`: Frontend TypeScript compiler settings and `@/*` path alias.
- `central-pet-front/vite.config.ts`: Frontend bundler config and aliases.
- `central-pet-back/package.json`: Backend scripts, dependencies, and inline Jest config.
- `central-pet-back/tsconfig.json`: Backend TypeScript settings.
- `central-pet-back/prisma/schema.prisma`: Prisma generator and datasource config.

**Core Logic:**

- `central-pet-front/src/routes.tsx`: Route registry and dynamic route builders.
- `central-pet-front/src/Components/PetRegister/PetRegisterForm.tsx`: Main registration workflow UI and persistence.
- `central-pet-front/src/Mocks/PetsStorage.ts`: Frontend local data repository.
- `central-pet-back/src/modules/pets/pets.controller.ts`: Main pet HTTP endpoints.
- `central-pet-back/src/modules/pets/pets.service.ts`: Current pet CRUD behavior.
- `central-pet-back/src/prisma/prisma.service.ts`: Database client provider.

**Testing:**

- `central-pet-front/src/test/setup.ts`: Frontend test setup.
- `central-pet-front/src/Components/Carousel.test.tsx`: Frontend component test example.
- `central-pet-front/src/Components/SidePanel.test.tsx`: Frontend component test example.
- `central-pet-front/tests/e2e/`: Frontend Playwright e2e tests.
- `central-pet-back/src/modules/pets/pets.service.spec.ts`: Backend unit test example.
- `central-pet-back/src/modules/pets/pets.controller.spec.ts`: Backend controller test example.
- `central-pet-back/test/`: Backend e2e test config and support files.

## Naming Conventions

**Files:**

- Use `PascalCase.tsx` for React components and pages: `central-pet-front/src/Pages/MainPage.tsx`, `central-pet-front/src/Components/PetModal.tsx`.
- Use `camelCase.ts` for route/config helper files and data helpers: `central-pet-front/src/routes.tsx`, `central-pet-front/src/Mocks/PetsStorage.ts`.
- Use `kebab-case` directory names for Nest feature folders: `central-pet-back/src/modules/pet-history/`, `central-pet-back/src/modules/adoption-requests/`.
- Use Nest suffix naming for backend files: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.dto.ts`.

**Directories:**

- Put frontend route screens under `Pages/` and reusable view pieces under `Components/`.
- Keep backend code grouped by feature under `central-pet-back/src/modules/<feature>/`.
- Reserve `generated/` and `dist/` for generated/build output rather than hand-written code.

## Where to Add New Code

**New Frontend Feature:**

- Primary code: Add route-level screens to `central-pet-front/src/Pages/` and reusable sections to `central-pet-front/src/Components/`.
- Tests: Add component tests beside the component in `central-pet-front/src/` or e2e coverage in `central-pet-front/tests/e2e/`.

**New Frontend Shared Module:**

- Implementation: Put browser data helpers in `central-pet-front/src/Mocks/` only if they are still mock/local-storage adapters. Put reusable type definitions in `central-pet-front/src/Models/`. Put layout chrome in `central-pet-front/src/Layout/`.

**New Backend Feature:**

- Primary code: Create a new folder in `central-pet-back/src/modules/<feature-name>/` with `<feature-name>.module.ts`, `<feature-name>.controller.ts`, and `<feature-name>.service.ts`.
- Tests: Add `*.spec.ts` files near the backend source in the same module folder and use `central-pet-back/test/` for e2e-level coverage.

**New Backend DTO or Validation Contract:**

- Implementation: Place request DTOs under `central-pet-back/src/modules/<feature-name>/dto/`.

**New Database Access Logic:**

- Implementation: Keep Prisma schema changes in `central-pet-back/prisma/schema.prisma` and consume the shared provider from `central-pet-back/src/prisma/prisma.service.ts` inside feature services.

**Utilities:**

- Shared frontend helpers: Prefer the closest feature folder first; promote only broadly reused helpers into a dedicated shared location after a second consumer exists.
- Shared backend helpers: Keep feature-local helpers inside the feature folder unless multiple modules use them, then introduce a focused shared folder under `central-pet-back/src/`.

## Special Directories

**`central-pet-front/dist/`:**

- Purpose: Frontend build output.
- Generated: Yes
- Committed: Yes in current repository state

**`central-pet-back/dist/`:**

- Purpose: Backend transpiled build output.
- Generated: Yes
- Committed: Yes in current repository state

**`central-pet-back/generated/`:**

- Purpose: Prisma generated client.
- Generated: Yes
- Committed: Yes in current repository state

**`central-pet-front/node_modules/` and `central-pet-back/node_modules/`:**

- Purpose: Installed dependencies for each app.
- Generated: Yes
- Committed: Yes in current repository state

**`.pnpm-store/`:**

- Purpose: Local pnpm package store cached in the repository workspace.
- Generated: Yes
- Committed: Yes in current repository state

---

_Structure analysis: 2026-03-27_
