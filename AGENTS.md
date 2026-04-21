AGENTS - Guidelines for Codex Agents

Overview

This document describes expectations for autonomous or semi-autonomous agents ("Codex" or similar) working on the Central-Pet repository. Follow project rules and the Central-Pet conventions. Use this file as the single source of truth for agent behavior when contributing code or tests.

Must-follow constraints

1. Do not remove or change comments in code unless explicitly requested by a human reviewer. Comments are part of project history and developer intent.
2. Always use pnpm for package management (install, scripts, test runners).
3. Before running or modifying tests, inspect the relevant package.json to discover test/lint/build scripts and the correct workspace filter (examples below).
4. Use .planning/codebase only for macro context and high-level architecture — do not treat it as canonical or static source of code.

Where to check package.json (common workspaces)

- Root: ./package.json — contains workspace scripts and aliases
- Backend: ./central-pet-back/package.json — backend build/test scripts (Jest, prisma tasks)
- Frontend: ./central-pet-front/package.json — frontend scripts (Vitest, lint, build)
- E2E tests: ./tests/package.json — Playwright E2E suite

Common pnpm commands

- Install all deps: pnpm install
- Build backend: pnpm --filter central-pet-back build
- Run backend tests: pnpm --filter central-pet-back test
- Run frontend tests: pnpm --filter central-pet-front test
- Run E2E tests: pnpm --filter central-pet-e2e-tests test OR pnpm --filter central-pet-e2e-tests test:e2e
- Generate Prisma client: (inside backend) pnpm run prisma:generate

Code Conventions

- Follow .planning/codebase/CONVENTIONS.md for creating new files, naming, exports, imports, TypeScript usage, error handling, lint rules, comment style, function design, and domain conventions.
- Comments and tests description must be in portuguese, code should be in English

Testing and changes

- Always run the relevant unit/e2e tests after making changes that affect behavior.
- Do not add or modify tests that change existing test intent unless asked. When adding tests, place them under tests/e2e/ or the appropriate package and follow existing patterns (helpers in tests/utils).
- Reproduce bugs with a failing test before fixing when possible.

Database & Migrations (backend)

- Use provided helper scripts in central-pet-back/scripts/ for DB setup/cleanup (setup-dev-db.js, clean-dev-tables.js, drop-dev-db.js).
- Prefer running migrations with pnpm exec prisma migrate deploy and regenerate client with pnpm run prisma:generate.

Safety & Data

- Never commit secrets or environment files.
- Avoid destructive DB operations unless explicitly authorized; scripts that drop or destroy databases must require explicit flags (e.g., --yes, --force).

When to ask a human

- Any structural change to architecture, database schema, auth, or CI must be proposed and confirmed first.
- Unclear test failures or flaky behavior that requires environment knowledge.

Appendix: Helpful locations

- Code: central-pet-front/, central-pet-back/, tests/
- Migrations and Prisma: central-pet-back/prisma/
- Helpers/tests: tests/utils/
- Project docs: README.md, QUICK_START.md, CONTRIBUTING.md, .planning/codebase/

If anything in this document should be expanded into a checklist or automation script, propose a short PR referencing AGENTS.md and the reason for the change.
