# Testes E2E - Central-Pet

Este pacote contém todos os testes end-to-end (E2E) do Central-Pet usando Playwright.

## 🎯 Objetivo

Testes E2E garantem que os principais fluxos de usuário funcionem corretamente em um ambiente próximo ao de produção.

## 📦 Instalação

### Primeira vez? Execute apenas:

```bash
# Na raiz do projeto
pnpm install
```

✨ **O navegador Chromium é instalado automaticamente no `postinstall`!**

### Instalação manual dos navegadores (se necessário):

```bash
# Da raiz do projeto
pnpm test:e2e:install

# Ou dentro da pasta tests/
pnpm install-browsers
```

## 🚀 Executando os Testes

### Da raiz do projeto:

```bash
# Executar todos os testes E2E
pnpm test:e2e

# Executar todos os testes (unit + e2e + front)
pnpm test:all
```

### Dentro da pasta `tests/`:

```bash
# Executar todos os testes (headless)
pnpm test

# Executar com interface visual (recomendado para desenvolvimento)
pnpm test:ui

# Executar em modo headed (mostra o navegador)
pnpm test:headed

# Executar em modo debug
pnpm test:debug

# Ver relatório do último teste
pnpm test:report
```

## 📋 Pré-requisitos

Antes de rodar os testes E2E:

1. **PostgreSQL rodando** (local ou Docker)

   ```bash
   node ../scripts/ensure-postgres.js
   ```

2. **Banco de teste configurado**

   ```bash
   cd ../central-pet-back && pnpm test:setup
   ```

3. **Navegador Chromium instalado** ✅ (já foi instalado automaticamente!)

## 📁 Estrutura

```text
tests/
├── e2e/                       # Arquivos de teste
│   ├── auth.spec.ts          # Testes de autenticação
│   ├── home.spec.ts          # Testes da página inicial
│   ├── pet-register.spec.ts  # Testes de cadastro de pets
│   ├── pet-profile.spec.ts   # Testes do perfil do pet
│   └── pet-ownership-workflow.spec.ts  # Fluxo completo de cadastro
├── global-setup.ts            # Setup global (seeds, etc)
├── playwright.config.ts       # Configuração do Playwright
├── package.json              # Dependências isoladas
└── README.md                 # Este arquivo
```

## ⚙️ Configuração

O Playwright está configurado para:

- ✅ Iniciar automaticamente o backend (porta 3001 - modo teste)
- ✅ Iniciar automaticamente o frontend (porta 5174 - modo teste)
- ✅ Executar testes em paralelo
- ✅ Capturar trace em caso de falha
- ✅ Usar modo headless por padrão
- ✅ Reutilizar servidores em desenvolvimento local (mais rápido)

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

## 📝 Notas Importantes

### Navegadores

- ✅ O Playwright **baixa seus próprios navegadores** (~150MB para Chromium)
- ✅ **NÃO usa** o Chrome/Brave/Edge instalado no sistema
- ✅ Navegadores ficam em:
  - Linux/macOS: `~/.cache/ms-playwright/`
  - Windows: `%USERPROFILE%\AppData\Local\ms-playwright\`

### Portas de Teste

Os testes usam portas diferentes do desenvolvimento normal para não conflitar:

- Backend teste: `http://localhost:3001`
- Frontend teste: `http://localhost:5174`
- Backend dev: `http://localhost:3000`
- Frontend dev: `http://localhost:5173`

## 🐛 Troubleshooting

### Erro: "Executable doesn't exist"

```bash
# Reinstale os navegadores
pnpm install-browsers
```

### Erro: "Connection refused" ou "ECONNREFUSED"

```bash
# Certifique-se que PostgreSQL está rodando
node ../scripts/ensure-postgres.js

# Configure o banco de teste
cd ../central-pet-back && pnpm test:setup
```

### Testes lentos no Windows

O Playwright pode ser mais lento no Windows. Considere:

- Usar WSL2 (melhor performance)
- Desabilitar antivírus temporariamente durante os testes
- Aumentar o timeout no `playwright.config.ts` se necessário

## 📚 Recursos

- [Documentação do Playwright](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Seletores](https://playwright.dev/docs/selectors)
- [Debugging Guide](https://playwright.dev/docs/debug)
