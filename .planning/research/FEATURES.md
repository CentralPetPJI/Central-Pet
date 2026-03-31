# Feature Landscape

**Domain:** Plataforma brownfield de adocao de pets com foco no milestone de contato estruturado, sinais de confianca e perfis mais confiaveis
**Researched:** 2026-03-27

## Milestone Scope

Esta pesquisa cobre apenas o que falta para o milestone atual. Home, perfil basico de pet, cadastro/edicao de pet, persistencia local e backend inicial ja existem e nao entram como escopo de descoberta aqui.

O padrao de mercado em produtos como Petfinder, Adopt a Pet/Rehome e PetRescue e consistente em quatro pontos:

1. o adotante entende rapidamente quem e o responsavel pelo pet
2. o perfil do pet expoe compatibilidade, historico e saude de forma estruturada
3. o CTA principal leva para um fluxo de interesse com contexto, nao para contato solto
4. a plataforma deixa claro o que acontece depois do primeiro contato

## Table Stakes

Features que o milestone precisa ter para o produto parecer confiavel, e nao apenas um classificado com pets.

| Feature                                        | Why Expected                                                                                                    | Complexity | Notes                                                                                                                                     |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Identificacao explicita do tipo de responsavel | Plataformas maduras distinguem shelter/rescue/private owner; sem isso o adotante nao entende com quem vai falar | Low        | Exibir ONG, protetor independente ou tutor pessoa fisica em card e perfil                                                                 |
| Bloco de confianca do responsavel              | O adotante espera pelo menos nome, cidade, canal de contato e nivel basico de verificacao                       | Medium     | Deve agrupar nome/organizacao, localizacao, tipo de responsavel, disponibilidade de contato e um ou dois sinais verificaveis              |
| CTA principal unica para demonstrar interesse  | Produtos de adocao evitam varios CTAs concorrentes; uma acao principal reduz ambiguidade                        | Low        | "Tenho interesse em adotar" ou equivalente, sempre acima da dobra no perfil                                                               |
| Fluxo de contato com contexto do pet           | O contato tipico ja nasce anexado ao pet e ao responsavel correto                                               | Medium     | Formulario ou sheet com pet preselecionado, resumo do responsavel e instrucoes do proximo passo                                           |
| Proximo passo explicito apos envio             | O usuario espera saber se vai enviar mensagem, formulario ou pedido de contato                                  | Low        | Exibir expectativa: "o responsavel recebera seu interesse e retornara por..."                                                             |
| Minimo obrigatorio para publicar pet           | Sem campos minimos, o perfil perde confianca e comparabilidade                                                  | Medium     | Nome, especie, sexo, porte, idade/faixa etaria, cidade, foto principal, status de saude essencial, tipo de responsavel e canal de contato |
| Compatibilidade domestica estruturada          | Produtos fortes mostram convivencia com criancas, caes, gatos e necessidades especiais                          | Medium     | Mais importante para decisao do que texto livre longo                                                                                     |
| Transparencia sobre saude e manejo             | Adotantes esperam vacinacao, castracao, microchip/identificacao quando aplicavel e observacoes relevantes       | Medium     | Melhor usar estados claros: informado, nao informado, nao se aplica                                                                       |
| Honestidade sobre campos ausentes              | Em adocao, ausencia escondida parece omissao                                                                    | Low        | Estados vazios honestos aumentam confianca mais do que esconder secoes                                                                    |
| Fixtures/mocks de usuarios para E2E            | Em brownfield, este milestone depende de variacoes reais de responsavel e contato para regressao confiavel      | Medium     | Criar mocks para ONG, protetor e tutor, com pets em diferentes niveis de completude e cenarios de interesse                               |

## Differentiators

Features que elevam a percepcao de seguranca e qualidade sem puxar o produto para operacao completa da adocao.

| Feature                                         | Value Proposition                                                                                                     | Complexity | Notes                                                                            |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------- |
| Sinais de confianca compostos, nao apenas badge | Em vez de um selo vazio, combina fatos como perfil completo, identidade do responsavel e politica de adocao informada | Medium     | Recomendar 2-4 sinais concretos; evitar "verificado" sem criterio claro          |
| Score ou status de completude do perfil do pet  | Ajuda o responsavel a melhorar o anuncio e ajuda o adotante a perceber qualidade de dados                             | Medium     | Bom fit para brownfield porque aproveita cadastro existente                      |
| Resumo de compatibilidade no topo do perfil     | Acelera decisao antes da leitura detalhada                                                                            | Low        | Ex.: apartamento, criancas, outros pets, energia, cuidados especiais             |
| Politica/processo de adocao resumidos no perfil | Reduz contato improdutivo porque o adotante entende requisitos antes                                                  | Medium     | Curto e estruturado: entrevista, visita, taxa, area de atuacao, etc.             |
| Contact intent presets                          | Melhora qualidade do lead sem virar triagem completa                                                                  | Medium     | Perguntas curtas como cidade, experiencia com pets e melhor horario para retorno |
| Status de anuncio fresco                        | Perfil com data de atualizacao reduz sensacao de abandono ou pet ja adotado                                           | Low        | "Atualizado em..." ou status "disponivel confirmado recentemente"                |
| Fonte do cuidado do pet                         | Diferencia pet em abrigo, foster temporario ou lar atual                                                              | Medium     | Especialmente util para tutor pessoa fisica e rehoming assistido                 |

## Anti-Features

Features que parecem relevantes, mas empurram o milestone para complexidade errada ou corroem confianca.

| Anti-Feature                                            | Why Avoid                                                                                      | What to Do Instead                                                                            |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Chat em tempo real dentro da plataforma                 | Complexidade alta cedo demais; moderacao, entrega, notificacao e historico viram outro produto | Usar fluxo assicrono de interesse com canal definido e expectativa clara                      |
| Formulario longo de candidatura logo no primeiro clique | Aumenta abandono e conflita com o escopo de "conexao ate contato"                              | Coletar apenas contexto essencial no primeiro interesse                                       |
| Badge de verificado sem criterio auditavel              | Cria falsa seguranca e vira passivo reputacional                                               | Exibir sinais concretos com criterios objetivos                                               |
| Exposicao publica irrestrita de telefone/WhatsApp/email | Aumenta spam, risco e scraping                                                                 | Mediar o primeiro contato via fluxo estruturado e revelar canal conforme regra do responsavel |
| Perfil do pet baseado principalmente em texto livre     | Dificulta comparacao, filtro e consistencia                                                    | Priorizar campos estruturados com texto livre complementar                                    |
| Escala de confianca punitiva para responsavel           | Pode penalizar quem ainda esta completando dados e gerar ruído em v1                           | Mostrar completude e fatos informados, nao "nota moral"                                       |
| Gestao completa do processo de adocao                   | Sai do milestone e puxa backlog de CRM, status, aprovacoes e historico                         | Parar no interesse enviado + expectativas de retorno                                          |

## Feature Dependencies

```text
Tipo de responsavel -> bloco de confianca do responsavel
Bloco de confianca do responsavel -> CTA de interesse com contexto
Minimo obrigatorio de dados -> perfil do pet mais confiavel
Compatibilidade estruturada + transparencia de saude -> resumo de compatibilidade
Fluxo de contato estruturado -> mocks de usuarios para E2E
```

## MVP Recommendation

Priorizar:

1. Identificacao do tipo de responsavel + bloco basico de confianca
2. CTA unica com fluxo de interesse estruturado e proximo passo explicito
3. Reforco de perfil confiavel do pet com minimo obrigatorio, compatibilidade estruturada e estados vazios honestos
4. Mocks/fixtures de usuarios e pets para cobrir ONG, protetor e tutor nos testes E2E

Defer:

- Politica/processo de adocao detalhados por responsavel: valioso, mas pode entrar depois do fluxo basico de interesse
- Score mais rico de confianca/completude: util depois que o criterio de dados obrigatorios estiver estavel
- Status de anuncio fresco com confirmacao recorrente: bom diferenciador, mas nao bloqueia o milestone

## Brownfield Implications

- Aproveitar o formulario existente para evoluir de "dados salvos" para "dados publicaveis com confianca".
- Modelar responsavel como entidade com tipo, sinais e contato, nao como campos soltos dentro do pet.
- Evitar retrabalho de UX: o perfil ja existe, entao o ganho vem de hierarquia de informacao, nao de criar novas paginas.
- Tratar mocks E2E como parte do milestone, porque os cenarios de confianca dependem de combinacoes reais de responsavel + pet + fluxo de contato.

## Sources

- Petfinder home, enfatizando rede de shelters e rescues e descoberta por entidade responsavel: https://www.petfinder.com/ (MEDIUM, fonte oficial do produto)
- Adopt a Pet article sobre rehoming responsavel, destacando perfis detalhados, contexto do tutor atual e cuidado com golpes: https://www.adoptapet.com/blog/adoption/finding-good-match-with-rehome (MEDIUM, fonte oficial editorial do produto, publicado em 2026-01-08)
- Rehome by Adopt a Pet signup/how-it-works flow, indicando gerenciamento de inquiries/applications e ocultacao de contato publico: https://rehome.adoptapet.com/auth/register (MEDIUM, fonte oficial do produto)
- PetRescue listing rules, exigindo pets genuinos, responsabilidade clara da organizacao e manutencao de confianca na plataforma: https://support.petrescue.com.au/article/170-petrescues-pet-listing-rules (MEDIUM, base oficial de suporte)
