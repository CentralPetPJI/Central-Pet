# Contribuindo com o Central-Pet 🐾

Obrigado por contribuir! Este guia reflete o fluxo atual do projeto (pnpm + Husky + lint-staged + testes automáticos no pre-push).

## ✨ Setup rápido para contribuir

1. Clone e entre no repositório:
   ```bash
   git clone https://github.com/CentralPetPJI/Central-Pet
   cd Central-Pet
   ```
2. Habilite o Corepack e instale dependências:
   ```bash
   corepack enable
   pnpm install
   ```
3. Em desenvolvimento, use os envs padrão já versionados:
   - `central-pet-back/.env.development`
   - `central-pet-front/.env.development`
4. Se for desenvolver com PostgreSQL local (sem Docker), prepare o banco:
   ```bash
   cd central-pet-back
   pnpm db:setup
   cd ..
   ```

## ✅ Fluxo recomendado de desenvolvimento

1. Crie uma branch descritiva:
   ```bash
   git checkout -b feat/minha-feature
   ```
2. Rode o projeto:
   ```bash
   pnpm dev
   ```
   ou, com Docker:
   ```bash
   pnpm dev:docker
   ```
3. Rode todos os testes (recomendado):
   ```bash
   pnpm test:all
   # ou
   pnpm test:front
   pnpm test:back
   pnpm test:e2e
   ```

## 🪝 Hooks Git (Husky)

Os hooks são configurados automaticamente no `pnpm install` via script `prepare`.

- `pre-commit`: executa `lint-staged` (formata/linta apenas arquivos staged).
- `pre-push`: executa `scripts/pre-push-tests.sh`, que:
  - garante PostgreSQL disponível (`node scripts/ensure-postgres.js`);
  - detecta arquivos alterados;
  - roda testes de forma inteligente:
    - só front → `pnpm test:front`
    - só back → `pnpm test:back`
    - front + back (ou arquivos estruturais) → `pnpm test:all`

> Evite pular hooks. `--no-verify` e `HUSKY=0` devem ser usados apenas em emergência, com justificativa no PR.

## 📝 Padrão de commits

Use [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/):

- `feat: adicionar fluxo de adoção`
- `fix: corrigir validação no cadastro de pet`
- `docs: atualizar guia de testes`
- `refactor: simplificar estratégia de autenticação`

## 🌐 Idioma do projeto

- Documentação, mensagens de commit e comentários: **português**
- Código e identificadores (variáveis, funções, tipos, componentes): **inglês**

## 🚀 Pull Request

1. Atualize sua branch com a `main`.
2. Garanta que os testes relevantes passaram localmente.
3. Atualize documentação quando houver mudança de fluxo/comando.
4. Descreva claramente no PR: problema, solução e impacto.

## 🐛 Troubleshooting para contribuições

### Hook não roda após `pnpm install`

- Execute `pnpm prepare`.
- Verifique se está em clone com `.git` disponível (hooks não instalam em ambientes sem metadata Git).

### `pre-push` falha por PostgreSQL

- Rode manualmente:
  ```bash
  node scripts/ensure-postgres.js
  ```
- Se usar banco local, confira `central-pet-back/.env.development`.
- Se usar Docker, suba ao menos o PostgreSQL:
  ```bash
  docker compose -f docker-compose.dev.yml up -d postgres
  ```

### `pre-commit` alterou arquivos e o commit falhou

- Isso é esperado quando `lint-staged` aplica correções.
- Rode:
  ```bash
  git add .
  git commit -m "sua mensagem"
  ```

### Falha em E2E por navegador ausente

- Instale browsers do Playwright:
  ```bash
  pnpm test:e2e:install
  ```

### Testes de backend falhando por banco de teste

- Rode:
  ```bash
  cd central-pet-back
  pnpm test:setup
  ```

Obrigado por ajudar a construir o Central-Pet! 🐶🐱
