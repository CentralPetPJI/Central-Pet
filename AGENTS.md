AGENTS - Diretrizes para Agentes Codex

Visão Geral

Este documento descreve as expectativas para agentes autônomos ou semi-autônomos ("Codex" ou similares) que trabalham no repositório Central-Pet. Siga as regras do projeto e as convenções do Central-Pet. Use este arquivo como fonte única de verdade para o comportamento do agente ao contribuir com código ou testes.

Restrições obrigatórias

1. Não remova nem altere comentários no código sem solicitação explícita de um revisor humano. Comentários fazem parte do histórico do projeto e da intenção do desenvolvedor.
2. Use sempre pnpm para gerenciamento de pacotes (install, scripts, test runners).
3. Antes de executar ou modificar testes, inspecione o package.json relevante para descobrir os scripts de teste/lint/build e o filtro de workspace correto (exemplos abaixo).
4. Use .planning/codebase apenas para contexto macro e arquitetura de alto nível — não o trate como fonte canônica ou estática de código.

Onde verificar o package.json (workspaces comuns)

- Raiz: ./package.json — contém scripts de workspace e aliases
- Backend: ./central-pet-back/package.json — scripts de build/teste do backend (Jest, tarefas do prisma)
- Frontend: ./central-pet-front/package.json — scripts do frontend (Vitest, lint, build)
- Testes E2E: ./tests/package.json — suíte E2E com Playwright

Comandos pnpm comuns

- Instalar todas as dependências: pnpm install
- Build do backend: pnpm --filter central-pet-back build
- Executar testes do backend: pnpm --filter central-pet-back test
- Executar testes do frontend: pnpm --filter central-pet-front test
- Executar testes E2E: pnpm --filter central-pet-e2e-tests test OU pnpm --filter central-pet-e2e-tests test:e2e
- Gerar cliente Prisma: (dentro do backend) pnpm run prisma:generate

Convenções de Código

- Siga .planning/codebase/CONVENTIONS.md para criação de novos arquivos, nomenclatura, exports, imports, uso de TypeScript, tratamento de erros, regras de lint, estilo de comentários, design de funções e convenções de domínio.
- A língua do projeto é o português brasileiro. Comentários, descrições de testes, mensagens de erro voltadas ao usuário e strings de interface devem ser escritos em português brasileiro.
- Funções, variáveis, tipos e demais identificadores no código principal devem ser nomeados em inglês, para manter a padronização técnica da base de código.
- NUNCA remova acentos ou caracteres especiais do português (ã, é, ç, ó, ú, â, ê, ô, etc.) de strings visíveis ao usuário, comentários ou descrições de testes. A remoção de acentos empobrece a legibilidade e vai contra o padrão do projeto.
- Exemplos do que NÃO fazer: substituir "não informado" por "nao informado", "inválido" por "invalido", "não encontrado" por "nao encontrado".

Testes e alterações

- Sempre execute os testes unitários/e2e relevantes após realizar alterações que afetem o comportamento.
- Não adicione nem modifique testes que alterem a intenção dos testes existentes sem ser solicitado. Ao adicionar testes, coloque-os em tests/e2e/ ou no pacote apropriado e siga os padrões existentes (helpers em tests/utils).
- Reproduza bugs com um teste com falha antes de corrigir, quando possível.

Banco de Dados e Migrações (backend)

- Use os scripts auxiliares fornecidos em central-pet-back/scripts/ para configuração/limpeza do banco de dados (setup-dev-db.js, clean-dev-tables.js, drop-dev-db.js).
- Prefira executar migrações com pnpm exec prisma migrate deploy e regenerar o cliente com pnpm run prisma:generate.

Segurança e Dados

- Nunca faça commit de segredos ou arquivos de ambiente.
- Evite operações destrutivas no banco de dados sem autorização explícita; scripts que derrubam ou destroem bancos de dados devem exigir flags explícitas (ex.: --yes, --force).

Quando consultar um humano

- Qualquer alteração estrutural em arquitetura, esquema de banco de dados, autenticação ou CI deve ser proposta e confirmada primeiro.
- Falhas de teste que não estejam claras ou comportamentos instáveis que exijam conhecimento do ambiente.

Apêndice: Localizações úteis

- Código: central-pet-front/, central-pet-back/, tests/
- Migrações e Prisma: central-pet-back/prisma/
- Helpers/testes: tests/utils/
- Documentação do projeto: README.md, QUICK_START.md, CONTRIBUTING.md, .planning/codebase/

Se alguma parte deste documento precisar ser expandida em um checklist ou script de automação, proponha um PR curto referenciando AGENTS.md e o motivo da alteração.
