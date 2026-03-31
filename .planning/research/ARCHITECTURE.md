# Architecture Research: v1.0 contato estruturado e confiança

**Scope:** Existing app extension only for the new milestone capabilities  
**Researched:** 2026-03-27  
**Confidence:** HIGH for integration fit with current codebase, MEDIUM for final schema details until implementation starts

## Recommended Architecture

The milestone should be implemented as a **structured profile and contact layer on top of the existing pet flow**, not as a separate adoption workflow system. The current frontend already has one strong page flow for register -> detail, and the backend already has the right Nest module shape. The missing piece is that responsible data, trust data, and contact data are still flattened into pet-local strings in the frontend and do not exist as first-class backend contracts.

Recommended target shape:

- Keep `Pet` as the main aggregate shown in discovery and detail pages.
- Introduce a nested `ResponsibleProfile` inside the pet read model rather than a fully separate frontend route/module for this milestone.
- Introduce a computed `TrustSignals` block on pet detail/read responses.
- Use the existing `adoption-requests` module as the backend home for structured contact intent, but keep the UI as a simple CTA/modal/form instead of chat or inbox.
- Keep frontend routing mostly unchanged: evolve existing pet register and pet detail pages instead of creating a parallel app area.

This gives the product explicit trust and contact structure while staying inside the current app shape and single-droplet deployment model.

## New And Modified Components

### Backend

#### Modify: `pets` module

`central-pet-back/src/modules/pets/` should become the source of truth for pet detail and listing data.

Add to the pet contract:

- `responsibleProfile`
  - `type`: `ONG | INDEPENDENT_PROTECTOR | INDIVIDUAL_TUTOR`
  - `displayName`
  - `city`
  - `contact`
  - `organizationName?`
  - `bio?`
- `trustSignals`
  - `hasDefinedResponsibleType`
  - `hasDirectContact`
  - `hasCity`
  - `hasHealthBasics`
  - `hasProfilePhoto`
  - `hasEnoughGallery`
  - `hasCompleteIdentity`
  - `score`
  - `badges`
- `publicationReadiness`
  - computed boolean used by frontend/admin form to block incomplete publish state

Why here:

- Discovery and pet detail both need these fields.
- Trust must be derived from persisted structured fields, not reconstructed in React from free-text notes.

#### Reuse and expand: `adoption-requests` module

`central-pet-back/src/modules/adoption-requests/` is currently empty and should own structured contact submission.

Recommended endpoints:

- `POST /api/pets/:id/contact-intents`
- `GET /api/pets/:id/contact-intents` only if internal review becomes necessary later

Recommended request contract for now:

- `petId`
- `adopterName`
- `adopterContact`
- `message`
- `preferredChannel`
- `contextSnapshot`
  - pet name
  - responsible display name
  - responsible type

Why here:

- Keeps contact structured without introducing chat.
- Preserves future upgrade path to full adoption workflow in v2.

#### Add: persistence models in Prisma

Current Prisma schema is still empty, so this milestone should add only the minimum persistent structure:

- `Pet`
- `ResponsibleProfile`
- `AdoptionContactIntent`

Recommended relation shape:

- `Pet` belongs to one `ResponsibleProfile`
- `ResponsibleProfile` has many `Pet`
- `AdoptionContactIntent` belongs to one `Pet`

Do not create in this milestone:

- auth user model
- verification workflow tables
- chat/conversation tables
- moderation pipeline tables

Those would overfit v1 and slow delivery.

### Frontend

#### Modify: register flow

`central-pet-front/src/Components/PetRegister/` should stop treating responsible data as generic pet notes.

Split form sections logically into:

- `PetIdentitySection`
- `PetHealthSection`
- `PetBehaviorSection`
- `ResponsibleProfileSection`
- `ContactSection`

You do not need to physically rename all files first, but the form state and validation should move to this mental model.

New form fields to promote from implicit strings to explicit structure:

- responsible type
- responsible display name
- organization/abrigo name when relevant
- city
- contact channel/value
- optional trust-supporting fields such as microchip and health basics already present

#### Modify: pet detail page

`central-pet-front/src/Pages/Pet/PetPersonalityProfilePage.tsx` should render four distinct blocks:

- pet summary
- responsible profile
- trust signals
- structured contact CTA

Recommended new UI components:

- `PetResponsibleCard`
- `PetTrustSignalsCard`
- `PetContactCard` or `PetContactIntentSheet`

Do not keep trust and contact inside the generic `Localizacao` block. That layout hides the product value.

#### Add: API client/repository layer

The current frontend reads directly from `Mocks/PetsStorage.ts`. For this milestone, introduce an adapter boundary rather than switching everything at once.

Recommended additions:

- `src/services/petsApi.ts`
- `src/services/adoptionRequestsApi.ts`
- `src/repositories/petsRepository.ts`

Repository behavior:

- read from backend first when API is available
- keep local mock fallback only for development/tests during migration
- expose normalized view models to pages/components

Why:

- avoids spreading fetch logic across pages
- makes E2E mocks deterministic
- supports incremental migration off `localStorage`

#### Add: E2E mock fixtures

Do not keep E2E user mocks as ad hoc UI seed data. Create stable fixtures that mirror the new contracts:

- `trusted-ong`
- `independent-protector`
- `individual-tutor`
- pets linked to each responsible profile
- contact intent fixture payloads

These should feed Playwright setup and optionally frontend dev mock mode, so tests validate the same responsible/trust/contact shape the app uses in production.

## Recommended Backend/Frontend Boundary

### Backend owns

- source of truth for pet read/write contracts
- responsible type taxonomy
- trust signal computation
- publish-readiness rules
- storage of contact intents

### Frontend owns

- form UX and validation hints
- rendering trust badges and CTA prominence
- temporary draft state before submit
- optimistic UI only if needed later

### Shared contract rule

The frontend should not compute canonical trust state from display strings. It may render helper previews while editing, but the persisted and displayed trust result should come from backend rules so detail pages, listings, and tests all agree.

## Data Flow Changes

### 1. Pet create/edit flow

1. User fills pet, responsible, and contact fields in the existing register page.
2. Frontend validates required fields locally for UX.
3. Frontend sends structured payload to `pets` API.
4. Backend persists pet + responsible relationship.
5. Backend computes `publicationReadiness` and `trustSignals`.
6. Frontend redirects to pet detail page using backend response.

### 2. Pet detail flow

1. Detail page loads pet by id through repository/API.
2. Response already contains `responsibleProfile` and `trustSignals`.
3. UI renders responsible identity, confidence indicators, and primary contact CTA from that contract.

### 3. Structured contact flow

1. User clicks primary CTA on pet detail.
2. Frontend opens lightweight form or sheet with pet/responsible context prefilled.
3. Frontend posts to `POST /api/pets/:id/contact-intents`.
4. Backend stores intent and returns a confirmation payload.
5. Frontend shows success state and clear next step.

This is enough for `CONT-01`, `CONT-02`, and `CONT-03` without introducing real-time messaging.

## Integration Points

### Existing code to modify

- `central-pet-front/src/Mocks/PetRegisterFormMock.ts`
  - replace flat responsible/contact fields with structured form shape
- `central-pet-front/src/Mocks/PetsStorage.ts`
  - demote from primary repository to fallback/mock adapter
- `central-pet-front/src/Pages/Pet/PetPersonalityProfilePage.tsx`
  - stop reconstructing trust/contact from local form state
- `central-pet-front/src/Components/PetProfile/PetProfileOverview.tsx`
  - remove responsibility for displaying mixed pet/responsible facts
- `central-pet-back/src/modules/pets/pets.service.ts`
  - replace in-memory array with Prisma-backed persistence and trust derivation
- `central-pet-back/prisma/schema.prisma`
  - add milestone data model
- `central-pet-back/src/modules/adoption-requests/adoption-requests.service.ts`
  - implement structured contact intent create flow

### New modules/components

- backend DTOs for structured responsible/contact payloads
- Prisma models for `ResponsibleProfile` and `AdoptionContactIntent`
- frontend API/repository layer for pets/contact intents
- frontend responsible/trust/contact UI cards
- Playwright fixture factory for responsible profile variants

## Build Order

Build this milestone in dependency order, not page order.

1. **Define contracts first**
   - add frontend TypeScript types for `ResponsibleProfile`, `TrustSignals`, and `ContactIntent`
   - add backend DTOs and Prisma schema
   - rationale: prevents rework across register/detail/E2E

2. **Persist pets correctly**
   - migrate `pets` module from in-memory records to Prisma
   - include nested responsible profile write/read support
   - rationale: detail page and tests need stable IDs and durable data

3. **Implement trust computation in backend**
   - add a pure service/helper that derives `trustSignals` and `publicationReadiness`
   - rationale: avoids duplicating logic across frontend and tests

4. **Implement structured contact intent endpoint**
   - use `adoption-requests` module for CTA submission
   - rationale: unlocks milestone contact value without waiting for broader workflow features

5. **Introduce frontend repository/API adapters**
   - switch detail page and register page to read/write through a repository layer
   - keep local fallback only behind adapter
   - rationale: controlled migration away from `Mocks/PetsStorage.ts`

6. **Refactor register form UI**
   - expose responsible type, trust-driving required fields, and contact structure clearly
   - rationale: form must produce the new backend contract

7. **Refactor pet detail UI**
   - add explicit responsible, trust, and contact sections
   - rationale: this is where milestone value becomes visible to adopters

8. **Add Playwright/E2E mock fixtures last**
   - create stable fixture profiles and contact submissions based on final contracts
   - rationale: test fixtures should validate final architecture, not temporary shapes

## Architecture Decisions

### Decision: keep responsible profile nested under pet read models

Use nested read models in v1 instead of a standalone responsible-profile domain exposed via separate routes. The product value is pet-centric right now, and every new screen should strengthen the pet detail flow rather than split navigation.

### Decision: compute trust server-side

Trust is part of product policy, not just UI decoration. Server-side derivation ensures consistency across list/detail/tests and keeps future scoring changes isolated.

### Decision: structured contact intent, not chat

The requirement is clearer and more reliable contact, not ongoing conversation management. A persisted contact intent endpoint is the lowest-complexity architecture that satisfies the milestone and preserves a path to v2.

## Risks And Guardrails

### Risk: half-migrated data model

If the frontend keeps building pet summaries from concatenated strings while backend uses structured contracts, detail pages will drift and tests will become brittle.

Guardrail:

- move all new milestone rendering to typed API/repository models
- keep legacy string-building only as temporary fallback

### Risk: over-building identity/auth

Responsible trust can tempt early auth/verification work. That is not required for this milestone.

Guardrail:

- use explicit responsible type + visible data completeness + clear contact context
- defer actual account verification workflow

### Risk: coupling E2E mocks to `localStorage`

Current mock flow is browser-storage centric. That will not hold once API-backed detail/contact flows land.

Guardrail:

- move E2E fixtures to contract-level data builders
- seed backend or intercept API consistently in Playwright

## Recommended Milestone Slice

If the team wants the smallest viable architecture slice, build exactly this:

- Prisma-backed pets with nested responsible profile
- backend trust computation
- pet detail responsible/trust/contact sections
- contact intent submission endpoint
- Playwright fixtures for three responsible archetypes

Everything else can remain unchanged until the next milestone.
