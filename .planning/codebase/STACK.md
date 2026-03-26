# Stack

## Workspace Shape

- Monorepo managed with `pnpm` workspaces, declared in `pnpm-workspace.yaml`.
- Root package metadata in `package.json` sets the package manager to `pnpm@10.30.1`.
- The only workspace package found is `central-pet-front` from `pnpm-workspace.yaml`.

## Runtime And Language

- Node.js is the runtime target. `.tool-versions` pins `nodejs 24.12.0`, and the Docker images also use `node:24.12.0-alpine` in `central-pet-front/Dockerfile` and `docker-compose.dev.yml`.
- The frontend is TypeScript-first. `central-pet-front/package.json` uses `"type": "module"`, and `central-pet-front/tsconfig.json` enables strict compilation settings such as `strict`, `noUnusedLocals`, and `noUnusedParameters`.
- The frontend code is React/TSX under `central-pet-front/src`, with alias-based imports configured in `central-pet-front/vite.config.ts` and `central-pet-front/vitest.config.ts`.

## Frontend Framework Stack

- React 18.3 and `react-dom` 18.3 power the UI, bootstrapped in `central-pet-front/src/main.tsx`.
- Routing uses `react-router-dom` 7.13, with route definitions in `central-pet-front/src/routes.tsx` and app wiring in `central-pet-front/src/App.tsx`.
- Styling is a mix of Tailwind CSS v4 and component CSS. `central-pet-front/package.json` includes `tailwindcss` and `@tailwindcss/vite`, while files like `central-pet-front/src/App.css`, `central-pet-front/src/index.css`, `central-pet-front/src/Layout/Header.css`, and `central-pet-front/src/Layout/Footer.css` provide local styles.
- Icons come from `lucide-react`.

## Validation And Tooling

- Vite is the primary dev server and bundler, configured in `central-pet-front/vite.config.ts`.
- Type checking and production builds run through `pnpm --filter central-pet-front build`, which executes `tsc && vite build`.
- Linting uses flat ESLint config in `central-pet-front/eslint.config.js`, with `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`.
- Formatting uses Prettier 3.8.1. Root `package.json` also defines `lint-staged` for `*.{js,jsx,ts,tsx,css}` and `*.{json,md}`.
- Unit tests use Vitest with `jsdom` in `central-pet-front/vitest.config.ts` and `@testing-library/react` in `central-pet-front/package.json`.
- End-to-end tests use Playwright in `central-pet-front/playwright.config.ts`; the configured test directory is `tests/e2e`.

## Packaging And Deployment

- Local development is containerized through `docker-compose.dev.yml`, which runs the frontend on port `5173`.
- Production packaging uses `central-pet-front/Dockerfile`, which builds the app in a Node stage and serves `dist` through `nginx:1.27-alpine`.
- `docker-compose.prod.yml` exposes the production container on `${FRONT_PORT:-8080}` and adds hardening options such as `read_only: true`, `security_opt: no-new-privileges:true`, and a healthcheck.
- The production Nginx config lives in `central-pet-front/nginx.conf`.
