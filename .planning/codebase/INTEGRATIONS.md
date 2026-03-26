# Integrations

## External APIs

- No live HTTP API client was found in `central-pet-front/src`. I did not find `fetch`, `axios`, `supabase`, `firebase`, or other client SDK usage in the inspected source.
- The app currently appears to be self-contained on the frontend, with no backend service integration code in the workspace root or `central-pet-front/src`.

## Persistence

- Browser `localStorage` is the only active persistence layer in the inspected code.
- `central-pet-front/src/Mocks/PetsStorage.ts` stores pets under `central-pet:pets` and pet profiles under `central-pet:pet-profiles`.
- `central-pet-front/src/Components/PetRegister/PetRegisterForm.tsx` also stores in-progress form state in `localStorage` keys such as `central-pet:register-form` and `central-pet:selected-personalities`.
- The storage helpers normalize and validate the stored payloads before use, so persistence is intentionally mock/local rather than database-backed.

## Auth And User Sessions

- There is a `/login` route in `central-pet-front/src/routes.tsx` and a header link to it in `central-pet-front/src/Layout/Header.tsx`, but no authentication provider, token handling, session middleware, or sign-in flow was found.
- `docs/planejamento-modelagem-banco.md` mentions auth as a separate concern, which matches the absence of implemented auth wiring in the app code.

## Webhooks And Background Services

- No webhook handlers, queue consumers, cron jobs, or background workers were found in the inspected files.
- `docker-compose.dev.yml` and `docker-compose.prod.yml` each define only the frontend service, so there is no composed backend integration in this repo state.

## Env-Driven Integration Points

- `.env.example` defines `BACK_PORT`, `FRONT_PORT`, and `CORS_ORIGIN`, but only `FRONT_PORT` is consumed directly in `docker-compose.prod.yml`.
- `CORS_ORIGIN` suggests an eventual cross-origin backend, but there is no matching backend implementation in the repository files inspected.
- `BACK_PORT` is currently implied rather than used, which supports the reading that backend integration is planned but not present.

## External Content Sources

- Image assets in `central-pet-front/src/Mocks/Pet.tsx` are loaded from `media.istockphoto.com`, so the UI depends on remote image hosting for seed data.
- Tests also reference external-looking image URLs such as `https://example.com/...` in `central-pet-front/src/Components/Carousel.test.tsx` and `central-pet-front/src/Components/PetModal.test.tsx`, but those are test fixtures rather than runtime integrations.
