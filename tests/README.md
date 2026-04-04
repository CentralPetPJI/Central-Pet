# Testes E2E - Central-Pet

Este pacote contém todos os testes end-to-end (E2E) do Central-Pet usando Playwright.

## 🎯 Objetivo

Testes E2E garantem que os principais fluxos de usuário funcionem corretamente em um ambiente próximo ao de produção.

## 📦 Instalação

As dependências são gerenciadas automaticamente pelo pnpm workspace. Na raiz do projeto:

```bash
pnpm install
```

## 🚀 Executando os Testes

### Da raiz do projeto:

```bash
# Executar todos os testes E2E
pnpm test:e2e

# Executar com interface visual
pnpm test:e2e:ui
```

### Dentro da pasta `tests/`:

```bash
# Executar todos os testes
pnpm test

# Executar com interface visual (recomendado para desenvolvimento)
pnpm test:ui

# Executar em modo headed (mostra o navegador)
pnpm test:headed

# Executar em modo debug
pnpm test:debug

# Ver relatório do último teste
pnpm test:report

# Gerar código de teste automaticamente (codegen)
pnpm test:codegen
```

## 📁 Estrutura

```text
tests/
├── e2e/                       # Arquivos de teste
│   ├── home.spec.ts          # Testes da página inicial
│   ├── pet-register.spec.ts  # Testes de cadastro de pets
│   ├── pet-profile.spec.ts   # Testes do perfil do pet
│   └── pet-ownership-workflow.spec.ts  # Fluxo completo de cadastro
├── playwright.config.ts       # Configuração do Playwright
├── package.json              # Dependências isoladas
└── README.md                 # Este arquivo
```

## ⚙️ Configuração

O Playwright está configurado para:

- ✅ Iniciar automaticamente o backend (porta 3000)
- ✅ Iniciar automaticamente o frontend (porta 5173)
- ✅ Executar testes em paralelo
- ✅ Capturar trace em caso de falha
- ✅ Usar modo headless por padrão

## 🧪 Escrevendo Testes

Consulte os testes existentes em `e2e/` como referência. Use seletores semânticos quando possível:

```typescript
// ✅ Bom - semântico e resiliente
await page.getByRole("button", { name: "Cadastrar" }).click();
await page.getByLabel("Nome do pet").fill("Rex");

// ❌ Evitar - frágil e dependente de implementação
await page.locator(".btn-primary").click();
await page.locator("#pet-name").fill("Rex");
```

## 📚 Recursos

- [Documentação do Playwright](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Seletores](https://playwright.dev/docs/selectors)
