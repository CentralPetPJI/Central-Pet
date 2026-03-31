# Domain Pitfalls

**Domain:** Contato estruturado, sinais de confianca, perfis mais confiaveis e mocks de usuarios para E2E em app React + Nest existente
**Researched:** 2026-03-27

## Critical Pitfalls

### Pitfall 1: Sinal de confianca sem lastro real

**What goes wrong:** O produto passa a mostrar badges como "verificado", "confiavel" ou "perfil completo" sem uma regra de negocio rastreavel por tras. Isso cria falsa seguranca para o adotante e vira passivo de produto logo no v1.
**Why it happens:** O milestone quer melhorar percepcao de seguranca antes de existir identidade, moderacao, auth e fonte unica de dados. Em brownfield, o atalho comum e decorar a UI antes de definir o criterio.
**Consequences:** Regressao de confianca, suporte manual para explicar badge, dados inconsistentes entre pets, e risco de prometer mais do que a plataforma realmente valida.
**Prevention:** Limitar sinais do v1 a estados objetivos e auditaveis, por exemplo `tipo de responsavel`, `perfil com dados minimos completos`, `canal de contato informado`, `cadastro institucional informado`. Cada sinal precisa ter definicao unica no backend ou em contrato compartilhado.
**Detection:** Badge muda sem mudanca de dado; dois pets do mesmo responsavel mostram sinais diferentes; time nao consegue explicar exatamente o criterio do selo.
**Warning signs:** PRs adicionando badges primeiro e regras depois; logica de confianca espalhada em componentes; nomes vagos como `trusted` sem enum/descricao.
**Future phase to address:** Phase "Trust Signal Contract And Rules"

### Pitfall 2: Contato estruturado implementado como texto solto

**What goes wrong:** O "contato estruturado" acaba salvo e exibido como string unica ou concatenado em campo livre, sem separar canal, nome exibido, contexto do pet e expectativa do proximo passo.
**Why it happens:** O fluxo atual serializa tutor, cidade e contato dentro de `notes`, e a UI ainda trata dados de perfil e resumo como formatos diferentes.
**Consequences:** Nao ha validacao consistente, nao ha como evoluir para CTA por canal, testes E2E ficam frageis por depender de texto concatenado, e qualquer mudanca de copy quebra leitura, edicao e filtros.
**Prevention:** Modelar contato como estrutura propria antes de mexer forte na UI: `contactChannel`, `contactValue`, `contactLabel`, `responsibleName`, `responsibleType`, `city`, `contactInstructions`. Nunca derivar contato de texto renderizado.
**Detection:** Necessidade de `split`, `includes` ou regex para reconstruir contato; edicao depende de parsing; mesma informacao aparece em `notes`, `formData` e card resumido.
**Warning signs:** Campos novos entrando em `notes`; CTA usando string montada manualmente; bugs do tipo "perfil mostra contato errado depois de editar".
**Future phase to address:** Phase "Structured Contact Data Model"

### Pitfall 3: Dados de responsavel acoplados ao pet em vez de entidade propria

**What goes wrong:** ONG, protetor e tutor pessoa fisica viram apenas variacoes de texto dentro do cadastro do pet, em vez de uma camada de dados de responsavel com identidade propria.
**Why it happens:** O app atual e pet-centric, com `tutor`, `shelter`, `city` e `contact` dentro do form do pet. O backend so conhece `responsibleUserId`, mas o frontend nao usa esse contrato.
**Consequences:** Duplicacao massiva de dados, divergencia entre anuncios do mesmo responsavel, impossibilidade de aplicar trust signals por responsavel, e migracao dolorosa quando auth/perfis reais entrarem.
**Prevention:** Introduzir um modelo explicito de `ResponsibleProfile` mesmo que o v1 ainda salve junto ao pet. O importante e separar o contrato e ownership desde ja.
**Detection:** Mesmo responsavel com nomes/cidades diferentes em pets distintos; badges calculados por anuncio, nao por perfil; update de contato exige editar varios pets.
**Warning signs:** Campos `responsibleType`, `organizationName`, `contact` adicionados so no form do pet sem camada compartilhada; ausencia de chave estavel de responsavel no frontend.
**Future phase to address:** Phase "Responsible Profile Foundation"

### Pitfall 4: Frontend e backend evoluem contratos diferentes para o mesmo milestone

**What goes wrong:** O frontend entrega novos campos de confianca, contato e perfil rico em mocks/localStorage, enquanto o Nest continua aceitando outro shape e outra semantica.
**Why it happens:** O repositorio ja tem dois sistemas de pets: frontend mockado e backend com DTO/IDs/enums diferentes. Esse milestone aumenta justamente as partes mais sensiveis dessa divergencia.
**Consequences:** Integracao trava tarde, adapters proliferam, testes passam em isolamento mas falham no fluxo real, e o roadmap perde fases inteiras para "alinhar contrato".
**Prevention:** Definir contrato canonico agora, com tabela de mapeamento entre UI e API eliminada o quanto antes. Campos de responsavel, confianca e contato devem nascer do contrato compartilhado, nao do mock.
**Detection:** Campo existe no React mas nao no DTO; enum do front nao bate com backend; E2E roda sem backend real; historias de UI entram sem payload acordado.
**Warning signs:** Novos mocks em `central-pet-front/src/Mocks/`; transformacoes ad hoc entre `dog/cat` e `DOG/CAT`; `responsibleUserId` ficando so no back.
**Future phase to address:** Phase "Frontend Backend Contract Alignment"

### Pitfall 5: Mock E2E vira produto paralelo

**What goes wrong:** Os mocks de usuarios para E2E evoluem mais que o dominio real e passam a mascarar buracos de fluxo, especialmente em responsavel, autenticacao, permissao e persistencia.
**Why it happens:** Playwright atual cobre cenarios felizes sobre dados locais; e tentador adicionar fixtures cada vez mais "espertas" para validar UI sem enfrentar integracao.
**Consequences:** Suite verde com confianca falsa, bugs reais so aparecem em homologacao/manual, e o time modela o produto em torno do mock em vez do contrato.
**Prevention:** Tratar mocks E2E como camada de teste, nao como fonte de verdade. Cada persona mockada deve mapear explicitamente para papeis e estados reais do dominio. Manter cenarios mistos: mockado para UX, integrado para contrato.
**Detection:** Cenarios E2E dependem de seeds impossiveis no backend real; personas mockadas tem campos que o produto ainda nao suporta; testes quebram quando copy muda mas nao quando contrato quebra.
**Warning signs:** Fixtures Playwright duplicando logica de negocio; nenhum teste exercitando API real; uso de storage/local state para simular autenticacao sem contrato correspondente.
**Future phase to address:** Phase "Test Persona And E2E Strategy"

## Moderate Pitfalls

### Pitfall 6: Completeness score punindo perfis honestos

**What goes wrong:** O sistema comunica "perfil incompleto" para campos que sao opcionais ou indisponiveis legitimamente, desencorajando anuncios honestos.
**Prevention:** Separar `obrigatorio para publicar`, `recomendado para confianca` e `opcional`. Estados vazios devem ser honestos sem parecer falha moral do responsavel.
**Warning signs:** Um unico percentual mistura foto, saude, microchip, abrigo, verificacao e galeria; falta de copy explicando o que e obrigatorio vs recomendado.
**Future phase to address:** Phase "Profile Completeness UX"

### Pitfall 7: Tipos de responsavel viram cosmetica de UI

**What goes wrong:** ONG, protetor independente e tutor pessoa fisica aparecem apenas como label visual, sem impacto real em campos, validacoes e mensagens.
**Prevention:** Cada tipo deve alterar formulario, copy e trust signals permitidos. Exemplo: ONG pode exibir nome institucional; pessoa fisica exige nome exibivel e contexto claro.
**Warning signs:** Mesmo schema para todos os tipos; nenhum teste por role/tipo; badges identicos entre tipos distintos.
**Future phase to address:** Phase "Responsible Type Specific UX"

### Pitfall 8: Estado vazio desonesto no perfil rico

**What goes wrong:** Campos novos de saude, historico e contato ausentes sao preenchidos com defaults otimistas ou placeholders de demo, fazendo o pet parecer mais confiavel do que e.
**Prevention:** Remover defaults de demo do fluxo real e exibir "nao informado" quando o dado nao existir. Ambiente de desenvolvimento deve usar fixtures separadas.
**Warning signs:** `initialPetRegisterFormData` populando paginas reais; fallback para imagens e contatos de exemplo; salvamento de placeholders sem interacao do usuario.
**Future phase to address:** Phase "Production Data Hygiene"

### Pitfall 9: Regras de exibicao copiadas em varios componentes

**What goes wrong:** Hero, overview, fact grid, cards e CTA reimplementam regra de label, badge e contato cada um do seu jeito.
**Prevention:** Centralizar view-model/formatter para perfil do pet e responsavel. A UI deve consumir dados ja normalizados para exibicao.
**Warning signs:** Varios componentes importando mocks e montando strings; mesma badge com copy diferente em cada tela.
**Future phase to address:** Phase "Pet Profile Presentation Layer"

### Pitfall 10: Evoluir mocks sem plano de migracao

**What goes wrong:** O app passa mais um milestone salvando tudo em `localStorage`, incluindo campos novos e possivelmente mais blobs, e depois a migracao para API vira retrabalho estrutural.
**Prevention:** Mesmo se a entrega ainda usar mock, criar uma camada de repositorio/client desde ja e isolar storage. Nao deixar componente saber se o dado vem de mock ou API.
**Warning signs:** Componentes chamando `window.localStorage` diretamente; novos campos entrando em chaves antigas; nenhuma interface de gateway/repository.
**Future phase to address:** Phase "Data Access Abstraction"

## Minor Pitfalls

### Pitfall 11: Copy de contato promete fluxo que o produto nao tem

**What goes wrong:** CTA, microcopy ou confirmacoes sugerem acompanhamento, triagem ou seguranca operacional que o v1 nao entrega.
**Prevention:** Ser explicito que o v1 encerra em demonstrar interesse/obter canal de contato. Nao insinuar moderacao ou gestao completa.
**Warning signs:** Textos como "acompanhe sua solicitacao" ou "adocao segura garantida" sem feature correspondente.
**Future phase to address:** Phase "Contact CTA And Messaging"

### Pitfall 12: Mocks E2E sem diversidade suficiente

**What goes wrong:** Todos os usuarios fake sao "bons casos": ONG completa, pet perfeito, contato valido, nenhum dado faltando.
**Prevention:** Incluir personas negativas e limiares: tutor pessoa fisica sem abrigo, ONG sem verificacao, pet com campos opcionais vazios, contato bloqueado para publicacao.
**Warning signs:** Suite inteira baseada em um unico fixture feliz; ausencia de cenarios de `nao informado`, `invalido`, `incompleto`.
**Future phase to address:** Phase "Edge Case E2E Coverage"

## Phase-Specific Warnings

| Phase Topic                         | Likely Pitfall                                        | Mitigation                                                                      |
| ----------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------- |
| Trust Signal Contract And Rules     | Criar selo subjetivo sem regra auditavel              | Definir matriz `signal -> source field -> eligibility rule -> copy` antes de UI |
| Structured Contact Data Model       | Persistir contato em string livre ou `notes`          | Criar schema tipado para contato e contexto do responsavel                      |
| Responsible Profile Foundation      | Duplicar dados do responsavel por pet                 | Introduzir entidade/contrato de responsavel separado do pet                     |
| Frontend Backend Contract Alignment | UI e API implementarem shapes diferentes              | Fechar DTO/mapper compartilhado antes de expandir formulario                    |
| Test Persona And E2E Strategy       | Suite mockada mascarar falhas reais                   | Separar testes UX mockados de testes de contrato/integracao                     |
| Profile Completeness UX             | Completeness score confundir obrigatorio com opcional | Definir tiers de campos e copy honesta para `nao informado`                     |
| Responsible Type Specific UX        | Tipo de responsavel virar apenas label                | Variar campos, validacoes e apresentacao por tipo                               |
| Production Data Hygiene             | Demo data vazar para fluxo real                       | Mover fixtures para ambiente de teste/dev e zerar defaults de producao          |
| Pet Profile Presentation Layer      | Regra de exibicao duplicada                           | Usar view-model unico para perfil e badges                                      |
| Data Access Abstraction             | Mais acoplamento com `localStorage`                   | Introduzir repository/client e esconder origem de dados                         |
| Contact CTA And Messaging           | Copy prometer mais que o v1 entrega                   | Revisar mensagens contra escopo do milestone                                    |
| Edge Case E2E Coverage              | So testar casos felizes                               | Adicionar personas limite e dados incompletos deliberadamente                   |

## Sources

- Internal codebase analysis: `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/codebase/CONCERNS.md`, `.planning/codebase/TESTING.md` and inspected source files in `central-pet-front/src/Mocks/`, `central-pet-front/src/Pages/Pet/`, `central-pet-back/src/modules/pets/dto/` - HIGH confidence
- Playwright docs on reusing authenticated/storage state for tests: https://playwright.dev/docs/api-testing - MEDIUM confidence for E2E strategy implications
- Prisma docs on one-to-many relations and explicit relational modeling: https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/one-to-many-relations - MEDIUM confidence for responsible-profile separation guidance
