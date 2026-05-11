# Central-Pet - Gemini CLI Guidelines

This document provides foundational mandates and expert procedural guidance for Gemini CLI when operating within the Central-Pet workspace. These instructions take absolute precedence over general defaults.

## 🏗️ Architectural Overview

Central-Pet is a monorepo consisting of:

- **Frontend**: React (TypeScript), Vite, Tailwind CSS. Located in `central-pet-front/`.
- **Backend**: NestJS, Prisma (PostgreSQL). Located in `central-pet-back/`.
- **E2E Tests**: Playwright. Located in `tests/`.

### Key Layers

- **Routing**: Centralized in `central-pet-front/src/routes.tsx`. Use `useAppRoutes()` hook in `App.tsx`.
- **State**: Auth state in `central-pet-front/src/lib/auth-context.tsx`.
- **Persistence**: Currently transitioning from browser `localStorage` (frontend) and in-memory mocks (backend) to a full PostgreSQL/Prisma stack.

## 🛠️ Engineering Standards

### Security & Integrity

- **Auth Strategy**: Controlled by `VITE_AUTH_STRATEGY` (values: `mock` or `session`).
- **Mock Auth**: Uses `x-mock-user-id` header in requests and `central-pet:mock-user-id` in localStorage.
- **Sensitive Data**: Never log or commit `.env.*` files.

### Coding Conventions

- **Naming**:
  - Components/Pages: `PascalCase.tsx`
  - Helpers/Modules: `camelCase.ts`
  - Backend Classes: `PascalCase` with suffix (`.controller.ts`, `.service.ts`)
  - Feature Modules: `kebab-case` directories.
- **Imports**: Use `@/` alias for frontend imports. Prefer named exports for helpers/types, though many legacy components use default exports.
- **Validation**:
  - Frontend: Use Zod for form schemas.
  - Backend: Use `class-validator` DTOs with NestJS `ValidationPipe`.
- **Error Handling**:
  - Backend: Use built-in Nest exceptions (`NotFoundException`, `BadRequestException`, etc.).
  - Frontend: Implement defensive loading with local fallbacks where appropriate during migration.

### Testing Mandates

- **Empirical Reproduction**: Always reproduce bugs with a test case before fixing.
- **Runners**:
  - Backend: Jest (`pnpm --filter central-pet-back test`)
  - Frontend: Vitest (`pnpm --filter central-pet-front test`)
  - E2E: Playwright (`pnpm test:e2e`)
- **Automated Validation**: Run relevant tests after _every_ modification.

## 🚀 Workflows

### Database Migrations

1. Modify `central-pet-back/prisma/schema.prisma`.
2. Run `cd central-pet-back && pnpm prisma migrate dev --name <name>`.
3. Update relevant DTOs and Services.

### Adding New Features

1. **Research**: Check existing modules in `central-pet-back/src/modules/` or pages in `central-pet-front/src/Pages/`.
2. **Strategy**: Propose changes. If complex, use `enter_plan_mode`.
3. **Execution**: Implement backend (Service -> Controller -> DTO) then frontend (Page/Component -> API call).
4. **Verification**: Add unit tests in the module and an E2E test in `tests/e2e/`.

### Linting & Formatting

- Use `pnpm lint` for linting and `pnpm format` for formatting across the entire monorepo.

### Testing

- Check `package.json` scripts for specific test commands.
- Run tests relevant to your changes. For example, if modifying backend logic, run `pnpm --filter central-pet-back test`.

## 📚 Reference Documentation

- [README.md](./README.md) - Project overview.
- [QUICK_START.md](./QUICK_START.md) - Setup instructions.
- [FAQ.md](./FAQ.md) - Troubleshooting.
- [.planning/codebase/](./.planning/codebase/) - Deep architectural mappings.
