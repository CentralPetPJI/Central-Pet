# Project Research Summary

**Project:** Central-Pet
**Domain:** Brownfield pet adoption platform milestone for structured contact, trust signals, richer responsible profiles, and E2E user mocks
**Researched:** 2026-03-27
**Confidence:** HIGH

## Executive Summary

This milestone is not a greenfield rebuild and should not be treated like one. The research converges on a narrower product move: evolve the existing pet-centric flow so adopters can immediately understand who is responsible for the pet, why that profile is trustworthy, and how to express interest through a structured contact CTA instead of loose contact text. Mature adoption products do this by making the responsible entity explicit, exposing structured pet and trust data, and setting a clear expectation for what happens after first contact.

The recommended approach is to keep the current `React + Vite + Zod + Nest + Prisma + Playwright` foundation and introduce a canonical domain shape centered on `ResponsibleProfile`, backend-derived `TrustSignals`, and a simple persisted contact-intent flow. The register form, pet detail page, and E2E fixtures should all align to that same contract. For this milestone, the product value comes from structured data and consistent rendering, not from chat, auth, moderation, or a new state-management stack.

The main risks are predictable and avoidable: fake trust badges without auditable rules, structured contact implemented as concatenated text, responsible data duplicated per pet, frontend and backend evolving different contracts, and Playwright mocks drifting away from the real domain. Mitigation is straightforward: define the shared contract first, compute trust from objective fields, isolate data access behind a repository/adapter boundary, and make E2E personas mirror real supported states instead of UI-only demo data.

## Key Findings

### Recommended Stack

No stack reset is justified for this milestone. The current frontend/backend/testing stack already supports the scope; the work is mostly domain modeling, UI refactoring, and deterministic test seeding. The only optional addition with clear value is `@faker-js/faker` for seeded fixture generation, and `react-hook-form` only if the existing pet form becomes too noisy after adding structured responsible/contact fields.

**Core technologies:**

- `React 18 + React Router DOM 7` — extend the existing register/detail flow instead of introducing new app areas.
- `Zod` — define one canonical schema for responsible profile, trust-related evidence, and structured contact data.
- `NestJS 11 + Prisma 7 + PostgreSQL` — persist pet, responsible, and contact-intent structures when the milestone stops relying only on frontend storage.
- `Playwright` — cover ONG, protetor independente, and tutor pessoa fisica scenarios with deterministic fixtures tied to the same domain contract.
- `Vitest` — test mapping, trust derivation helpers, and CTA/view-model logic without adding new mocking infrastructure.

### Expected Features

The table stakes are clear: explicit responsible type, a trust block with auditable facts, one primary CTA for interest, contact flow with pet context, clear next-step messaging, a minimum publishable data bar, structured compatibility and health data, honest empty states, and realistic user/persona fixtures for E2E. For this milestone, that is the core of "contato estruturado" and "perfil mais confiavel".

**Must have (table stakes):**

- Explicit responsible identification — adopters need to know if they are contacting an ONG, independent protector, or individual tutor.
- Basic responsible trust block — show name, city, contact channel, and objective confidence facts.
- Single primary interest CTA with context — attach intent to the pet and responsible profile, not to a loose phone number or free text.
- Clear next step after submit — state how the responsible party will receive and respond to the interest.
- Minimum publication fields and honest empty states — trust comes from structured completeness and transparent absence, not from hiding gaps.
- E2E personas and pet fixtures — cover realistic combinations of responsible type, completeness level, and contact setup.

**Should have (competitive):**

- Composite trust signals — a small set of explainable signals beats a vague "verified" badge.
- Compatibility summary near the top — helps adopters decide faster with structured fit data.
- Short adoption process summary and intent presets — useful if kept lightweight and tied to the current CTA flow.
- Updated/freshness indicator — helpful, but not blocking for the milestone.

**Defer (v2+):**

- Real-time chat or inbox workflows — wrong complexity for the current goal.
- Long first-click application forms — increases abandonment and expands scope into adoption operations.
- Any unverifiable trust badge or punitive score — creates liability before the platform has real verification.
- Full adoption process management, moderation, or verification infrastructure — beyond milestone boundaries.

### Architecture Approach

The architecture recommendation is consistent across the research: keep `Pet` as the main aggregate, add a nested `ResponsibleProfile` to pet read/write models, derive `TrustSignals` from objective stored fields, and route structured first contact through the existing `adoption-requests` backend module. On the frontend, refactor the existing register and detail pages instead of building parallel flows, add a repository/API boundary so UI stops depending directly on `Mocks/PetsStorage.ts`, and move E2E fixtures to contract-level persona builders.

**Major components:**

1. `pets` domain contract — owns pet data plus nested `responsibleProfile`, `trustSignals`, and `publicationReadiness`.
2. `adoption-requests` module — owns persisted structured contact intent submission, not chat.
3. Frontend repository/API adapter — hides whether data comes from backend or temporary mock fallback and normalizes the view model.
4. Register form sections — capture pet identity, health, behavior, responsible profile, and contact as explicit structure.
5. Pet detail UI blocks — separate pet summary, responsible profile, trust signals, and structured contact CTA.
6. Playwright fixture layer — seeds stable persona-based scenarios aligned with the final contract.

### Critical Pitfalls

1. **Trust signal without auditable backing** — only expose objective signals with a single rule source; do not ship vague badges like "confiavel" or "verificado".
2. **Structured contact stored as loose text** — define typed contact fields and CTA data before UI polish; never keep evolving `notes` into a pseudo-schema.
3. **Responsible data duplicated per pet** — introduce `ResponsibleProfile` as an explicit contract now, even if v1 persistence remains pet-adjacent.
4. **Frontend and backend diverge on shape and meaning** — agree the canonical contract first and make register, detail, and E2E consume it.
5. **Mocks become a parallel product** — keep persona fixtures as test tooling mapped to real supported roles and states, with some contract/integration coverage beyond happy-path UI mocks.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Canonical Domain Contract

**Rationale:** Every later change depends on one agreed structure for responsible identity, trust evidence, and contact intent.
**Delivers:** TypeScript types, Zod schemas, backend DTOs, Prisma models, and mapping rules for `ResponsibleProfile`, `TrustSignals`, and contact intent.
**Addresses:** explicit responsible type, trust block foundation, minimum publication fields, structured contact flow.
**Avoids:** frontend/backend contract drift, trust badges without criteria, contact as free text.

### Phase 2: Persistence And Trust Rules

**Rationale:** Detail pages and tests need stable persisted data and one source of truth for trust computation before UI refinement.
**Delivers:** Prisma-backed pet/responsible persistence, backend trust derivation, publication-readiness rules, and contact-intent endpoint in `adoption-requests`.
**Uses:** `Nest`, `Prisma`, `PostgreSQL`, `Zod`.
**Implements:** pets module as source of truth plus structured first-contact backend flow.
**Avoids:** duplicated trust logic in React, inconsistent badges across pets, fragile `localStorage`-only behavior.

### Phase 3: Frontend Register And Detail Refactor

**Rationale:** Once contracts and persistence are stable, the UI can expose the milestone value cleanly without rework.
**Delivers:** register form sections for responsible/contact data, explicit responsible/trust/contact blocks on pet detail, single primary CTA, honest empty states, and next-step messaging.
**Addresses:** responsible identification, one clear CTA, profile confidence, compatibility/health structure, user-facing trust visibility.
**Avoids:** mixed responsibilities in generic profile blocks, copy promising more than the product delivers, UI-only trust semantics.

### Phase 4: E2E Persona Coverage

**Rationale:** Test fixtures should validate the final contract and milestone behaviors, not temporary frontend-only shapes.
**Delivers:** deterministic Playwright personas for trusted ONG, independent protector, and individual tutor, plus edge cases for incomplete and unavailable data.
**Uses:** `Playwright`, seeded fixture factories, repository/API seeding strategy.
**Implements:** scenario-based E2E for interest CTA, trust rendering, and profile completeness states.
**Avoids:** mocks masking real contract gaps, happy-path-only confidence, brittle string-based tests.

### Phase Ordering Rationale

- Contract-first is mandatory because the milestone risk is semantic drift, not missing libraries.
- Persistence and backend trust rules should precede frontend polish so the UI renders explainable data instead of inventing it.
- Register and detail belong together after the contract stabilizes because they are two sides of the same pet/responsible model.
- E2E belongs last so personas validate the final supported shapes and include both good and degraded cases.

### Research Flags

Phases likely needing deeper research during planning:

- **Phase 2: Persistence And Trust Rules** — needs careful Prisma/Nest shape decisions and clarity on whether this milestone truly migrates off frontend-only persistence.
- **Phase 4: E2E Persona Coverage** — needs a deliberate choice between backend seeding, API interception, or repository-level dev fallback so tests do not stay coupled to `localStorage`.

Phases with standard patterns (skip research-phase):

- **Phase 1: Canonical Domain Contract** — the research is already aligned on the needed shapes and constraints.
- **Phase 3: Frontend Register And Detail Refactor** — implementation is mostly straightforward UI decomposition once the contract exists.

## Confidence Assessment

| Area         | Confidence | Notes                                                                                                         |
| ------------ | ---------- | ------------------------------------------------------------------------------------------------------------- |
| Stack        | HIGH       | Based primarily on current codebase fit; research strongly agrees no new platform layer is needed.            |
| Features     | HIGH       | Table stakes and anti-features are well aligned with comparable adoption products and milestone requirements. |
| Architecture | HIGH       | Strong codebase-fit guidance; only final schema granularity remains to be settled in implementation.          |
| Pitfalls     | HIGH       | Risks are directly grounded in current brownfield structure and observed divergence points.                   |

**Overall confidence:** HIGH

### Gaps to Address

- Persistence scope decision: confirm during planning whether this milestone ships backend-backed responsible/contact data or keeps a temporary repository fallback for part of the flow.
- Trust rule granularity: finalize which signals are required for v1 and which are merely recommended so completeness does not become punitive.
- Responsible identity ownership: decide whether multiple pets can immediately share one persisted responsible profile or if that normalization is phased in behind the same contract.
- E2E seed strategy: choose one deterministic path for tests that validates the real contract and does not deepen direct `localStorage` coupling.

## Sources

### Primary (HIGH confidence)

- [STACK.md](/home/vard/repos/my_repos/Central-Pet/.planning/research/STACK.md) — existing stack fit, domain modeling recommendations, and E2E fixture strategy
- [ARCHITECTURE.md](/home/vard/repos/my_repos/Central-Pet/.planning/research/ARCHITECTURE.md) — target component boundaries, backend/frontend ownership, and build order
- [PITFALLS.md](/home/vard/repos/my_repos/Central-Pet/.planning/research/PITFALLS.md) — brownfield-specific failure modes and phase warnings grounded in the current codebase

### Secondary (MEDIUM confidence)

- [FEATURES.md](/home/vard/repos/my_repos/Central-Pet/.planning/research/FEATURES.md) — market expectations and milestone scoping
- https://www.petfinder.com/ — responsible-entity clarity and adoption discovery expectations
- https://rehome.adoptapet.com/auth/register — structured inquiry flow and hidden public contact pattern
- https://support.petrescue.com.au/article/170-petrescues-pet-listing-rules — platform trust and listing-quality expectations
- https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/one-to-many-relations — relational modeling guidance for responsible profiles
- https://playwright.dev/docs/api-testing — implications for deterministic E2E setup and storage/API strategies

---

_Research completed: 2026-03-27_
_Ready for roadmap: yes_
