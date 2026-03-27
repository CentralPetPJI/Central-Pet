# External Integrations

**Analysis Date:** 2026-03-27

## APIs & External Services

**Application API Surface:**

- Internal backend API - NestJS endpoints exposed under `/api`
  - SDK/Client: No dedicated frontend client detected; reverse proxy is configured in `central-pet-front/nginx.conf` and routes exist in `central-pet-back/src/modules/pets/pets.controller.ts` and `central-pet-back/src/modules/health/health.controller.ts`
  - Auth: No API auth mechanism detected in `central-pet-back/src/` or `central-pet-front/src/`

**GitHub Platform:**

- GitHub Actions AI Inference - issue rewriting workflow in `.github/workflows/issue_updater.yml`
  - SDK/Client: `actions/ai-inference@v1`
  - Auth: `${{ secrets.GITHUB_TOKEN }}` used through `GH_TOKEN` in `.github/workflows/issue_updater.yml`
- GitHub CLI - workflow edits issues and posts comments in `.github/workflows/issue_updater.yml`
  - SDK/Client: `gh` CLI invoked in workflow shell steps
  - Auth: `${{ secrets.GITHUB_TOKEN }}`

**Reverse Proxy / Edge:**

- Caddy - optional host-level TLS termination and reverse proxy setup in `scripts/setup-single-droplet-prod.sh`
  - SDK/Client: Not applicable
  - Auth: No app-level auth; optional `CONTACT_EMAIL` config for certificate lifecycle

## Data Storage

**Databases:**

- PostgreSQL
  - Connection: `DATABASE_URL` required by `central-pet-back/prisma.config.ts` and `central-pet-back/src/prisma/prisma.service.ts`
  - Client: Prisma client generated into `central-pet-back/generated/prisma` from `central-pet-back/prisma/schema.prisma`
- Internal dev/prod container options
  - Development container: `postgres:16-alpine` in `docker-compose.dev.yml`
  - Production internal-db profile: `postgres:17-alpine` in `docker-compose.prod.yml`

**File Storage:**

- Local filesystem only
  - Frontend static assets live under `central-pet-front/public/` and `central-pet-front/src/assets/`
  - No S3, Cloudinary, UploadThing, or equivalent storage SDK detected

**Caching:**

- None detected
  - No Redis, Memcached, or application cache service imports in `central-pet-back/src/` or `central-pet-front/src/`

## Authentication & Identity

**Auth Provider:**

- Not detected
  - Implementation: No `Passport`, `JWT`, `Clerk`, `Auth0`, Firebase Auth, or custom auth middleware detected in `central-pet-back/src/` or `central-pet-front/src/`

## Monitoring & Observability

**Error Tracking:**

- None detected
  - No Sentry, Bugsnag, Datadog, Rollbar, or similar SDK imports found

**Logs:**

- NestJS `Logger` on backend bootstrap in `central-pet-back/src/main.ts`
- Docker health checks in `docker-compose.prod.yml`
- Nginx access/error logging via container defaults from `central-pet-front/Dockerfile`
- GitHub Actions job logs in `.github/workflows/issue_updater.yml`

## CI/CD & Deployment

**Hosting:**

- Docker Compose deployment from `docker-compose.prod.yml`
- Frontend served by Nginx container from `central-pet-front/Dockerfile`
- Backend served by Node container from `central-pet-back/Dockerfile`
- Single-host deployment behind Caddy on Ubuntu/Debian in `scripts/setup-single-droplet-prod.sh`

**CI Pipeline:**

- GitHub Actions workflow present in `.github/workflows/issue_updater.yml`
- No automated test/build/deploy CI workflow detected beyond the issue-formatting automation

## Environment Configuration

**Required env vars:**

- `DATABASE_URL` - backend and Prisma database connection in `central-pet-back/prisma.config.ts`, `central-pet-back/src/prisma/prisma.service.ts`, and `docker-compose.prod.yml`
- `FRONTEND_URL` - backend CORS origin in `central-pet-back/src/main.ts` and `docker-compose.prod.yml`
- `PORT` - backend listen port in `central-pet-back/src/main.ts` and `docker-compose.prod.yml`
- `FRONT_PORT` - production frontend bind port in `docker-compose.prod.yml` and `scripts/setup-single-droplet-prod.sh`
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` - internal PostgreSQL container config in `docker-compose.prod.yml`
- `DOMAIN`, `CONTACT_EMAIL`, `DB_MODE`, `SERVICE`, `ENV_FILE` - deployment script inputs in `scripts/setup-single-droplet-prod.sh`

**Secrets location:**

- Local env files are present at repo root and in `central-pet-back/`; examples include `.env.example`, `.env.prod.example`, and `central-pet-back/.env.example`
- Production deploy script defaults to `.env.prod` in `scripts/deploy-prod.sh`
- GitHub workflow secret uses `${{ secrets.GITHUB_TOKEN }}` in `.github/workflows/issue_updater.yml`

## Webhooks & Callbacks

**Incoming:**

- GitHub Issues event webhook handled by GitHub Actions `issues` trigger in `.github/workflows/issue_updater.yml`
- No application-level webhook controller detected in `central-pet-back/src/`

**Outgoing:**

- GitHub issue update and comment callbacks executed through `gh issue edit` and `gh issue comment` in `.github/workflows/issue_updater.yml`
- Browser-to-backend proxy target `http://back:3000/api/` configured in `central-pet-front/nginx.conf`

---

_Integration audit: 2026-03-27_
