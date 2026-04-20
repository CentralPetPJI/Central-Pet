# External Integrations

**Analysis Date:** 2026-04-18

## Summary

- Integrations are internal-first: the app integrates directly with a PostgreSQL database via Prisma and uses an internal session-based auth (session cookie). The frontend communicates with the backend via a configured API base URL and uses cookies (`withCredentials`) for auth. Docker Compose and nginx are used for service orchestration and reverse proxying in prod.

## APIs & External Services

- Database: PostgreSQL
  - Prisma datasource is configured for PostgreSQL in `central-pet-back/prisma/schema.prisma`.
    - Evidence: `central-pet-back/prisma/schema.prisma` lines 12-14 (datasource provider = "postgresql")
  - Prisma client is initialized with `process.env.DATABASE_URL` in `central-pet-back/src/prisma/prisma.service.ts`.
    - Evidence: `central-pet-back/src/prisma/prisma.service.ts` lines 8-16 (reads `process.env.DATABASE_URL` and constructs adapter)

- Auth & Sessions: Internal session store (Prisma sessions)
  - Sessions are created/deleted via Prisma in `central-pet-back/src/modules/auth/auth.service.ts` (see session.create at lines 33-37)
    - Evidence: `central-pet-back/src/modules/auth/auth.service.ts` lines 33-37
  - Session cookie name is `central_pet_session` defined in `central-pet-back/src/utils/session-cookie.ts` line 1
    - Evidence: `central-pet-back/src/utils/session-cookie.ts` line 1
  - Frontend axios instance sends credentials/cookies: `central-pet-front/src/lib/api.ts` sets `withCredentials: true` and reads `VITE_API_URL` from env: `central-pet-front/src/lib/api.ts` lines 3-8
    - Evidence: `central-pet-front/src/lib/api.ts` (lines: 3-8)

- Reverse Proxy / Web Server
  - Nginx configuration proxies `/api/` to `http://back:3000/api/` in `nginx.config.prod`.
    - Evidence: `nginx.config.prod` lines 18-21
  - Front Dockerfile copies `central-pet-front/nginx.conf` into the nginx image at build time: `central-pet-front/Dockerfile` line 17
    - Evidence: `central-pet-front/Dockerfile` line 17

- CI / Testing tools (local/in-repo)
  - Playwright exists in `tests/` workspace for E2E (see `tests/` in workspace list in `pnpm-workspace.yaml`) - evidence: `/pnpm-workspace.yaml` lines 1-4

## Integration points (files & code locations)

- Frontend -> Backend HTTP client
  - `central-pet-front/src/lib/api.ts` - creates Axios instance with baseURL from `import.meta.env.VITE_API_URL` and `withCredentials: true`.
    - Evidence: `central-pet-front/src/lib/api.ts` lines 3-8

- Backend DB access (Prisma)
  - `central-pet-back/src/prisma/prisma.service.ts` - reads `DATABASE_URL` and constructs Prisma client adapter.
    - Evidence: `central-pet-back/src/prisma/prisma.service.ts` lines 8-16
  - `central-pet-back/prisma/schema.prisma` - schema and models; generator outputs to `generated/prisma`.
    - Evidence: `central-pet-back/prisma/schema.prisma` lines 6-10 and 12-14

- Auth/session enforcement
  - `central-pet-back/src/modules/auth/session.guard.ts` (SessionGuard) reads cookie `central_pet_session` and delegates to `AuthService` for validation.
    - Evidence: `central-pet-back/src/modules/auth/guards/session.guard.ts` lines 19-26 and 43-46
  - `central-pet-back/src/modules/auth/auth.service.ts` creates/deletes sessions via Prisma: lines 33-37 and 82-85
    - Evidence: `central-pet-back/src/modules/auth/auth.service.ts` (lines: 33-37, 82-85)

- CORS and FRONTEND_URL
  - `central-pet-back/src/bootstrap/setup-app.ts` enables CORS with `origin: process.env.FRONTEND_URL` and `credentials: true`.
    - Evidence: `central-pet-back/src/bootstrap/setup-app.ts` lines 16-19

## Environment variables (existence and where used)

- Files present (do not expose contents):
  - Root: `.env`, `.env.prod`, `.env.prod.example` — file existence observed at repo root
    - Evidence: repository root listing shows `.env`, `.env.prod`, `.env.prod.example`
  - Frontend package contains `.env`, `.env.development`, `.env.example`, `.env.production`, `.env.test` under `central-pet-front/` (do not read contents)
    - Evidence: `central-pet-front/` directory listing

- Key env vars referenced in code and compose files (where used):
  - `DATABASE_URL` - required by Prisma and referenced in `central-pet-back/src/prisma/prisma.service.ts` and `central-pet-back/Dockerfile`, `docker-compose.*` files
    - Evidence: `central-pet-back/src/prisma/prisma.service.ts` lines 8-12; `central-pet-back/Dockerfile` lines 18-21; `docker-compose.dev.yml` line 31; `docker-compose.prod.yml` lines 32-39
  - `VITE_API_URL` - frontend axios base URL; `central-pet-front/src/lib/api.ts` lines 3-6
    - Evidence: `central-pet-front/src/lib/api.ts` lines 3-6
  - `VITE_AUTH_STRATEGY` - switches client auth strategy (mock vs session) in `central-pet-front/src/lib/auth/strategies/factory.ts` and set in `docker-compose.dev.yml` front service env: `docker-compose.dev.yml` lines 5-7 and `factory.ts` lines 17-24
    - Evidence: `docker-compose.dev.yml` lines 5-7; `central-pet-front/src/lib/auth/strategies/factory.ts` lines 17-24
  - `FRONTEND_URL` - used by backend CORS and set in compose: `central-pet-back/src/bootstrap/setup-app.ts` lines 16-19 and `docker-compose.dev.yml` back environment line 30
    - Evidence: `central-pet-back/src/bootstrap/setup-app.ts` lines 16-19; `docker-compose.dev.yml` line 30
  - `POSTGRES_*` variables in `docker-compose.prebuilt.yml` and `docker-compose.prod.yml` for production DB setup (e.g., `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`): `docker-compose.prebuilt.yml` lines 6-11 and `docker-compose.prod.yml` lines 6-11
    - Evidence: `docker-compose.prebuilt.yml` (lines 6-11); `docker-compose.prod.yml` (lines 6-11)

- Notes on secrets: `.env` files exist in repo root and `central-pet-front/`. Do NOT commit secrets. Compose files reference `.env.prod` for production images in `docker-compose.prebuilt.yml` line 31 (env_file: ./.env.prod).
  - Evidence: `docker-compose.prebuilt.yml` line 31 and repository root listing

## Docker / Networking notes

- Service discovery in Compose uses service names: nginx/nginx.conf and `nginx.config.prod` proxy to `back:3000` (internal service name). Evidence: `nginx.config.prod` lines 18-21

- Dev compose wiring
  - `docker-compose.dev.yml` defines `front`, `back`, and `postgres` and sets `depends_on` with healthchecks that point to internal service addresses. Evidence: `docker-compose.dev.yml` lines 10-13 (front depends_on back), 36-38 (back depends_on postgres) and healthcheck snippets 52-63

- Production compose expects environment injection
  - `docker-compose.prebuilt.yml` and `docker-compose.prod.yml` require env var expansion for DB credentials and image names and include `read_only`/tmpfs/pids/mem limits and security options for hardened runtime. Evidence: `docker-compose.prebuilt.yml` and `docker-compose.prod.yml` (multiple lines cited earlier)

## What is NOT integrated (observed)

- No external file storage (S3/Cloudinary) detected. Evidence: `central-pet-front` stores images in browser/local mocks; no cloud storage SDKs in `package.json`.
- No external auth providers (Auth0, Firebase, Supabase, Keycloak) detected in dependencies.
- No payment or messaging third-party SDKs (Stripe, Twilio, AWS SDK) detected in `package.json` dependency lists.

Relevant files (quick map)

- `central-pet-front/src/lib/api.ts` - axios client using `VITE_API_URL` and `withCredentials` (evidence lines 3-8)
- `central-pet-front/src/lib/auth/strategies/factory.ts` - picks auth strategy using `VITE_AUTH_STRATEGY` (evidence lines 17-24)
- `central-pet-back/src/prisma/prisma.service.ts` - Prisma initialization using `DATABASE_URL` (evidence lines 8-16)
- `central-pet-back/prisma/schema.prisma` - datasource `postgresql` (evidence lines 12-14)
- `central-pet-back/src/modules/auth` - session creation and guards: `auth.service.ts`, `guards/session.guard.ts` (evidence lines cited above)
- `docker-compose.dev.yml`, `docker-compose.prebuilt.yml`, `docker-compose.prod.yml` - compose-based orchestration (evidence: multiple lines)
- `.env`, `.env.prod`, `.env.*` - present in repo (do not read contents)

---

*Integration audit: 2026-04-18*
