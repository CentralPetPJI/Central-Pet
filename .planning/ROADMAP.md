# Roadmap: Central-Pet

## Overview

Este roadmap cobre o milestone `v1.0 Fluxo de adoção e contato estruturado`. A sequência prioriza primeiro o contrato canônico de responsável, confiança e contato; depois a persistência e regras; em seguida a refatoração do cadastro/perfil; e por fim a cobertura E2E com personas realistas. O objetivo é fazer o produto transmitir mais clareza e segurança para adoção sem expandir escopo para busca, doações ou gestão completa do processo.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Canonical Domain Contract** - Definir o contrato base de responsável, confiança e contato.
- [ ] **Phase 2: Persistence And Trust Rules** - Persistir o novo shape e centralizar as regras objetivas de confiança.
- [ ] **Phase 3: Register And Profile Refactor** - Expor o novo contrato no cadastro, edição e perfil do pet.
- [ ] **Phase 4: E2E Persona Coverage** - Validar o fluxo com personas e cenários realistas de adoção.

## Phase Details

### Phase 1: Canonical Domain Contract

**Goal**: Definir um contrato único para `ResponsibleProfile`, `TrustSignals` e `StructuredContact`, compartilhado entre frontend, backend e testes.
**Depends on**: Nothing (first phase)
**Requirements**: [RESP-01, RESP-02, RESP-05, TRST-02, CONT-03, PLAT-01]
**Success Criteria** (what must be TRUE):

1. Frontend e backend usam o mesmo significado para tipo de responsável, sinais de confiança e dados de contato.
2. O contrato aceita ONG, protetor independente e tutor pessoa física sem depender de texto solto.
3. Os testes conseguem construir fixtures/personas a partir desse mesmo shape.
   **Plans**: 3 plans

Plans:

- [ ] 01-01-PLAN.md — Create the shared responsible/contact/trust contract and app-local consumption surfaces.
- [ ] 01-02-PLAN.md — Refactor frontend types, storage, and personas to use the canonical contract.
- [ ] 01-03-PLAN.md — Refactor backend DTOs, service records, and contact scaffolding to use the canonical contract.

### Phase 2: Persistence And Trust Rules

**Goal**: Persistir os dados estruturados de responsável e contato, e derivar sinais de confiança a partir de regras objetivas.
**Depends on**: Phase 1
**Requirements**: [PET-04, TRST-01, TRST-02, TRST-03, TRST-04, CONT-03, PLAT-01]
**Success Criteria** (what must be TRUE):

1. Dados de responsável, contato e confiança sobrevivem ao fluxo de cadastro, edição e consulta.
2. O sistema não mistura dados entre pets diferentes.
3. Os sinais de confiança exibidos ao usuário são derivados de regras consistentes e auditáveis.
   **Plans**: TBD

Plans:

- [ ] 02-01: TBD

### Phase 3: Register And Profile Refactor

**Goal**: Atualizar cadastro, edição e perfil do pet para exibir identidade do responsável, confiança e CTA estruturado de contato.
**Depends on**: Phase 2
**Requirements**: [PET-01, PET-02, PET-03, RESP-01, RESP-03, RESP-04, RESP-05, CONT-01, CONT-02, CONT-04, PLAT-02]
**Success Criteria** (what must be TRUE):

1. O perfil do pet deixa claro quem é o responsável e como entrar em contato.
2. O cadastro permite preencher os dados que compõem o perfil confiável do pet.
3. O usuário vê uma próxima etapa clara ao demonstrar interesse em adoção.
   **Plans**: TBD

Plans:

- [ ] 03-01: TBD

### Phase 4: E2E Persona Coverage

**Goal**: Cobrir o milestone com testes E2E baseados em personas realistas e alinhadas ao contrato final.
**Depends on**: Phase 3
**Requirements**: [E2E-01, E2E-02, E2E-03, PLAT-03]
**Success Criteria** (what must be TRUE):

1. Existem cenários E2E para ONG, protetor independente e tutor pessoa física.
2. Os testes cobrem ao menos um caso de perfil completo e um caso com dados limitados.
3. Os mocks/personas de teste não divergem do contrato real do produto.
   **Plans**: TBD

Plans:

- [ ] 04-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase                            | Plans Complete | Status      | Completed |
| -------------------------------- | -------------- | ----------- | --------- |
| 1. Canonical Domain Contract     | 0/3            | Not started | -         |
| 2. Persistence And Trust Rules   | 0/TBD          | Not started | -         |
| 3. Register And Profile Refactor | 0/TBD          | Not started | -         |
| 4. E2E Persona Coverage          | 0/TBD          | Not started | -         |

### Phase 5: Auth Abstraction Layer

**Goal:** Refactor frontend mock user context into a flexible auth abstraction with strategy pattern that works with mock auth today but can swap to JWT with minimal changes in v1.1.
**Requirements**: TBD
**Depends on:** Phase 4
**Plans:** 2 plans

Plans:
- [ ] 05-01-PLAN.md — Create auth types, strategy interface, MockAuthStrategy, JwtAuthStrategy skeleton, and factory
- [ ] 05-02-PLAN.md — Refactor AuthProvider to use strategy pattern, ensure backwards compatibility

### Phase 6: refatroacao do storage

**Goal:** Centralizar a camada de storage do frontend fora de `lib`, migrando helpers e consumidores imediatos para a nova estrutura sem alterar o contrato backend.
**Requirements**: [STOR-01, STOR-02, STOR-03, STOR-04]
**Depends on:** Phase 5
**Plans:** 3 plans

Plans:
- [x] 06-01-PLAN.md — Move auth/session storage out of `lib` and switch auth/api consumers to the new module.
- [x] 06-02-PLAN.md — Relocate pet/form/id/personalities storage helpers into `src/storage/pets` with compatibility shims.
- [x] 06-03-PLAN.md — Repoint app consumers, tests, and E2E seed to the new storage layout and remove old references.

### Phase 7: refatoração types/models backend e frontend

**Goal:** Separar contratos de domínio, API e UI em backend/frontend, mantendo o backend como referência e preservando o comportamento atual por meio de mapeadores.
**Requirements**: [TYPE-01, TYPE-02, TYPE-03, TYPE-04]
**Depends on:** Phase 6
**Plans:** 4 plans

Plans:
- [x] 07-01-PLAN.md — Extract reusable backend pet domain model and mapping helpers.
- [x] 07-02-PLAN.md — Split backend pet DTOs into input and output contracts.
- [x] 07-03-PLAN.md — Split frontend models into domain files and keep compatibility barrels.
- [x] 07-04-PLAN.md — Migrate consumers and API mappers to the new model boundaries.
