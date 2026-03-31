# Architecture

**Analysis Date:** 2026-03-27

## Pattern Overview

**Overall:** Split frontend/backend application architecture inside a single repository.

**Key Characteristics:**

- Keep browser UI code in `central-pet-front/src/` and HTTP API code in `central-pet-back/src/`.
- Use feature-oriented backend modules under `central-pet-back/src/modules/` with the NestJS controller -> service pattern.
- Use page-driven frontend routing in `central-pet-front/src/routes.tsx`, with pages composing reusable UI sections from `central-pet-front/src/Components/`.

## Layers

**Frontend Bootstrap Layer:**

- Purpose: Start the React app, attach routing, and mount the root component.
- Location: `central-pet-front/src/main.tsx`
- Contains: `ReactDOM.createRoot`, `BrowserRouter`, root CSS import, `App` mount.
- Depends on: `react`, `react-dom`, `react-router-dom`, `central-pet-front/src/App.tsx`
- Used by: Vite entry resolution from `central-pet-front/index.html`

**Frontend Application Shell Layer:**

- Purpose: Define the persistent page frame and choose whether shared chrome like the side panel is visible.
- Location: `central-pet-front/src/App.tsx`
- Contains: `Header`, `Footer`, `SidePanel`, route registration through `useRoutes`.
- Depends on: `central-pet-front/src/routes.tsx`, `central-pet-front/src/Layout/`, `central-pet-front/src/Components/SidePanel.tsx`, `central-pet-front/src/Mocks/PetsStorage.ts`
- Used by: `central-pet-front/src/main.tsx`

**Frontend Routing/Page Layer:**

- Purpose: Map URLs to screen-level components and convert route params into page props.
- Location: `central-pet-front/src/routes.tsx`, `central-pet-front/src/Pages/`
- Contains: Route definitions, route path builders, page components such as `central-pet-front/src/Pages/MainPage.tsx` and `central-pet-front/src/Pages/Pet/PetPersonalityProfilePage.tsx`
- Depends on: `react-router-dom`, page-level imports from `central-pet-front/src/Components/` and `central-pet-front/src/Mocks/`
- Used by: `central-pet-front/src/App.tsx`

**Frontend Feature Component Layer:**

- Purpose: Render reusable UI sections for registration, profile display, carousel browsing, and form controls.
- Location: `central-pet-front/src/Components/`
- Contains: Feature folders such as `central-pet-front/src/Components/PetRegister/` and `central-pet-front/src/Components/PetProfile/`, plus shared form primitives in `central-pet-front/src/Components/Form/`
- Depends on: Props from pages, model types from `central-pet-front/src/Models/Types.ts`, mock state helpers from `central-pet-front/src/Mocks/`
- Used by: Page components in `central-pet-front/src/Pages/`

**Frontend Client-State/Data Adapter Layer:**

- Purpose: Normalize form data, persist browser state, and provide local data accessors.
- Location: `central-pet-front/src/Mocks/`
- Contains: Static seed data in `central-pet-front/src/Mocks/Pet.tsx`, local storage adapters in `central-pet-front/src/Mocks/PetsStorage.ts`, Zod schema/form defaults in `central-pet-front/src/Mocks/PetRegisterFormMock.ts`
- Depends on: `window.localStorage`, model definitions, `zod`
- Used by: `central-pet-front/src/App.tsx`, `central-pet-front/src/Pages/`, `central-pet-front/src/Components/PetRegister/PetRegisterForm.tsx`

**Backend Bootstrap Layer:**

- Purpose: Create the Nest application, apply global middleware/pipes, and expose the API.
- Location: `central-pet-back/src/main.ts`
- Contains: `NestFactory.create`, CORS setup, `/api` prefix, global `ValidationPipe`
- Depends on: `central-pet-back/src/app.module.ts`, NestJS platform packages
- Used by: Nest CLI start/build commands from `central-pet-back/package.json`

**Backend Composition Layer:**

- Purpose: Wire global providers and import feature modules.
- Location: `central-pet-back/src/app.module.ts`, `central-pet-back/src/prisma/prisma.module.ts`
- Contains: `ConfigModule.forRoot`, `PrismaModule`, module imports for health, pets, pet history, and adoption requests
- Depends on: `@nestjs/config`, feature modules in `central-pet-back/src/modules/`, Prisma provider in `central-pet-back/src/prisma/prisma.service.ts`
- Used by: `central-pet-back/src/main.ts`

**Backend Feature Module Layer:**

- Purpose: Group each API concern behind its own controller and service pair.
- Location: `central-pet-back/src/modules/`
- Contains: `health`, `pets`, `pet-history`, `adoption-requests`
- Depends on: Nest decorators, DTOs under `central-pet-back/src/modules/pets/dto/`, shared providers such as `PrismaService`
- Used by: `central-pet-back/src/app.module.ts`

**Backend Transport Layer:**

- Purpose: Convert HTTP requests into service calls and bind validation-aware DTOs.
- Location: `central-pet-back/src/modules/*/*.controller.ts`
- Contains: Route decorators like `@Controller('pets')`, `@Post()`, `@Get(':id')`, parameter extraction via `@Body()` and `@Param()`
- Depends on: Service classes and DTO classes
- Used by: Nest runtime request handling

**Backend Domain/Service Layer:**

- Purpose: Hold endpoint behavior and state transitions for each feature.
- Location: `central-pet-back/src/modules/*/*.service.ts`
- Contains: Health check response logic in `central-pet-back/src/modules/health/health.service.ts` and pet CRUD behavior in `central-pet-back/src/modules/pets/pets.service.ts`
- Depends on: DTOs, Node `crypto`, Nest exceptions, optionally `PrismaService`
- Used by: Controllers in the same module

**Backend Infrastructure Layer:**

- Purpose: Provide database connectivity and generated client access.
- Location: `central-pet-back/src/prisma/prisma.service.ts`, `central-pet-back/prisma/schema.prisma`, `central-pet-back/generated/prisma/`
- Contains: Global Prisma service, datasource/generator config, generated client artifacts
- Depends on: `DATABASE_URL`, `@prisma/adapter-pg`, generated client output at `central-pet-back/generated/prisma/client`
- Used by: Any backend service that needs persistence

## Data Flow

**Frontend Navigation and Rendering Flow:**

1. `central-pet-front/src/main.tsx` mounts `App` inside `BrowserRouter`.
2. `central-pet-front/src/App.tsx` calls `useRoutes` with route objects from `central-pet-front/src/routes.tsx`.
3. A page component in `central-pet-front/src/Pages/` loads local data through `central-pet-front/src/Mocks/PetsStorage.ts` and passes normalized props into feature components from `central-pet-front/src/Components/`.

**Frontend Pet Registration Flow:**

1. `central-pet-front/src/Pages/Pet/PetPersonalityRegisterPage.tsx` extracts `petId` and renders `central-pet-front/src/Components/PetRegister/PetRegisterForm.tsx`.
2. `central-pet-front/src/Components/PetRegister/PetRegisterForm.tsx` initializes form state from `getPetProfileById` or `getPetById` in `central-pet-front/src/Mocks/PetsStorage.ts`.
3. The form validates with `petRegisterFormSchema` from `central-pet-front/src/Mocks/PetRegisterFormMock.ts`, writes to `window.localStorage`, then redirects to the detail route built by `central-pet-front/src/routes.tsx`.

**Backend Request Flow:**

1. `central-pet-back/src/main.ts` receives an HTTP request under `/api/*` and applies the global `ValidationPipe`.
2. A controller such as `central-pet-back/src/modules/pets/pets.controller.ts` binds request data into `CreatePetDto` or `UpdatePetDto`.
3. The controller delegates to the service, for example `central-pet-back/src/modules/pets/pets.service.ts`, which returns a response object or throws `NotFoundException`.

**Backend Persistence Flow:**

1. `central-pet-back/src/app.module.ts` imports the global `PrismaModule`.
2. `central-pet-back/src/prisma/prisma.service.ts` constructs a Prisma client using `DATABASE_URL` and the PostgreSQL adapter.
3. Feature services are expected to consume that provider for persistence, but the active pets implementation in `central-pet-back/src/modules/pets/pets.service.ts` still stores records in a private in-memory array instead of using Prisma.

**State Management:**

- Frontend state is local-component state plus browser persistence through `window.localStorage` in `central-pet-front/src/Mocks/PetsStorage.ts`.
- Backend state is mixed: infrastructure for PostgreSQL exists in `central-pet-back/src/prisma/`, but current feature behavior is mostly stateless or in-memory.

## Key Abstractions

**Route Map:**

- Purpose: Centralize URL patterns and route builders.
- Examples: `central-pet-front/src/routes.tsx`
- Pattern: Static route object with `path`, `element`, and optional `build` helper for dynamic segments.

**Pet Register Form Data:**

- Purpose: Represent the editable frontend form payload independently from backend DTOs.
- Examples: `central-pet-front/src/Mocks/PetRegisterFormMock.ts`, `central-pet-front/src/Components/PetRegister/PetRegisterForm.tsx`
- Pattern: Local schema-backed object validated with Zod before persistence.

**Local Storage Repository:**

- Purpose: Hide browser storage parsing, validation, and fallback behavior.
- Examples: `central-pet-front/src/Mocks/PetsStorage.ts`
- Pattern: Free functions acting as a client-side repository adapter.

**Nest Feature Module:**

- Purpose: Package a vertical slice of API functionality.
- Examples: `central-pet-back/src/modules/pets/pets.module.ts`, `central-pet-back/src/modules/health/health.module.ts`
- Pattern: Module file exports controller/service pair; imported once in `central-pet-back/src/app.module.ts`.

**DTO Validation Contract:**

- Purpose: Constrain incoming HTTP payloads before they reach business logic.
- Examples: `central-pet-back/src/modules/pets/dto/create-pet.dto.ts`, `central-pet-back/src/modules/pets/dto/update-pet.dto.ts`
- Pattern: Decorator-based validation using `class-validator` and `class-transformer`.

**Global Prisma Provider:**

- Purpose: Share one database client across modules.
- Examples: `central-pet-back/src/prisma/prisma.module.ts`, `central-pet-back/src/prisma/prisma.service.ts`
- Pattern: `@Global()` Nest module exporting a service that extends `PrismaClient`.

## Entry Points

**Frontend App Entry:**

- Location: `central-pet-front/src/main.tsx`
- Triggers: Vite dev server, build output, browser load
- Responsibilities: Mount React, enable router context, import global CSS

**Frontend Route Shell:**

- Location: `central-pet-front/src/App.tsx`
- Triggers: Every frontend navigation
- Responsibilities: Register routed pages, render layout chrome, derive side-panel summary from stored pet data

**Backend App Entry:**

- Location: `central-pet-back/src/main.ts`
- Triggers: `npm run start`, `npm run dev`, Nest build/start flows in `central-pet-back/package.json`
- Responsibilities: Create Nest app, configure CORS, apply validation, expose `/api`

**Backend Root Module:**

- Location: `central-pet-back/src/app.module.ts`
- Triggers: Nest bootstrap
- Responsibilities: Assemble global config, infrastructure, and feature modules

**Prisma Schema Entry:**

- Location: `central-pet-back/prisma/schema.prisma`
- Triggers: `npm run prisma:generate`, `postinstall`
- Responsibilities: Define generator/datasource configuration and generated client output path

## Error Handling

**Strategy:** Validate input early and throw framework exceptions for request-level failures.

**Patterns:**

- Backend rejects invalid request bodies globally with `ValidationPipe` in `central-pet-back/src/main.ts`.
- Backend feature services throw typed Nest exceptions such as `NotFoundException` in `central-pet-back/src/modules/pets/pets.service.ts`.
- Frontend storage adapters in `central-pet-front/src/Mocks/PetsStorage.ts` recover from malformed local storage by clearing keys and falling back to seed data.

## Cross-Cutting Concerns

**Logging:** Nest bootstrap logging is created with `Logger` in `central-pet-back/src/main.ts`. No shared frontend logging abstraction is present.

**Validation:** Frontend form validation uses Zod through `central-pet-front/src/Mocks/PetRegisterFormMock.ts`. Backend request validation uses `class-validator` DTOs and the global `ValidationPipe` in `central-pet-back/src/main.ts`.

**Authentication:** Not implemented in active code. `routes.login` exists in `central-pet-front/src/routes.tsx`, but there is no mounted login page and no backend auth module under `central-pet-back/src/modules/`.

---

_Architecture analysis: 2026-03-27_
