# 🚀 Central-Pet - Quick Start

**Guia rápido e direto para começar - funciona em Windows, Linux e macOS.**

---

## 📋 Pré-requisitos (instale apenas uma vez)

### Obrigatórios:

- **Node.js 24+** → https://nodejs.org
- **PostgreSQL** → Escolha UMA opção:
  - **OPÇÃO A:** PostgreSQL local → https://www.postgresql.org/download/
  - **OPÇÃO B:** Docker Desktop → https://www.docker.com/products/docker-desktop

---

## ⚡ Setup Inicial (5 minutos)

### 1. Clone e instale dependências

```bash
git clone <repo-url>
cd Central-Pet
corepack enable
pnpm install
```

### 2. Ambiente de desenvolvimento

Em dev, o projeto já vem com configuração padrão pronta:

- `central-pet-back/.env.development`
- `central-pet-front/.env.development`

Edite esses arquivos apenas se precisar ajustar algo localmente.

### 3. Prepare o banco de dados

**OPÇÃO A - Docker (mais fácil):**

```bash
# Inicia todos os serviços (PostgreSQL + backend + frontend):
pnpm dev:docker
```

✨ Pronto! Tudo configurado e rodando.

**OPÇÃO B - Hibrido:**

```bash
# Inicia apenas o PostgreSQL via Docker:
docker compose -f docker-compose.dev.yml up --build -d postgres

# Roda serviços localmente (backend + frontend):
pnpm dev
```

**OPÇÃO C - PostgreSQL Local:**

```bash
# Ajuste o .env.development do backend com suas credenciais do PostgreSQL local
# Configura banco + migrations automaticamente:
cd central-pet-back
pnpm db:setup

# Volte para raiz e inicie:
cd ..
pnpm dev
```

---

## 🎯 Usar no Dia a Dia

### Desenvolvimento com Docker (recomendado)

```bash
pnpm dev:docker         # Inicia tudo
pnpm dev:docker:logs    # Ver logs
pnpm dev:docker:down    # Parar
```

### Desenvolvimento sem Docker

```bash
# Certifique-se que PostgreSQL está rodando e o .env.development do backend está configurado
pnpm dev                # Inicia frontend + backend
```

### Acessar:

- 🌐 Frontend: http://localhost:5173
- 🔧 Backend: http://localhost:3000/api
- 📊 Prisma Studio: `cd central-pet-back && pnpm prisma:studio`

---

## 🧪 Rodar Testes

### Setup dos testes (primeira vez):

```bash
cd central-pet-back
pnpm test:setup         # Cria banco de teste
```

### Executar testes:

```bash
# Unit tests (backend)
pnpm test:back

# Testes frontend
pnpm test:front

# Testes E2E (requer PostgreSQL rodando)
pnpm test:e2e

# TODOS os testes
pnpm test:all
```

---

## 🔑 Autenticação (Desenvolvimento)

**Durante desenvolvimento, use mock auth (padrão):**

- Não precisa login real
- Múltiplos usuários disponíveis para simular diferentes cenários
- Configurado em `VITE_AUTH_STRATEGY=mock`

**Trocar para sessão:**

- Edite `central-pet-front/.env.development`
- Mude para `VITE_AUTH_STRATEGY=session`

---

## 🐛 Problemas Comuns

### "Connection refused" no banco

**Causa:** PostgreSQL não está rodando

**Solução:**

- **Docker:** `pnpm dev:docker`
- **Local Windows:** Inicie o serviço PostgreSQL no Services
- **Local Linux:** `sudo systemctl start postgresql`
- **Local macOS:** `brew services start postgresql@16`

### "Port already in use"

**Causa:** Porta já ocupada

**Solução:**

```bash
# Descubra o processo:
# Windows: netstat -ano | findstr :5173
# Linux/macOS: lsof -i :5173

# Mate o processo ou mude a porta no .env.development
```

### Testes falhando

**Causa:** Banco de teste não configurado

**Solução:**

```bash
cd central-pet-back
pnpm test:setup
```

### Chromium não encontrado (testes E2E)

**Solução:**

```bash
pnpm test:e2e:install
```

---

## 📚 Próximos Passos

- **Contribuir?** Leia [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Dúvidas?** Veja [FAQ.md](./FAQ.md) ou abra uma issue

---

## 🆘 Ainda com problemas?

1. Limpe e reinstale tudo:

   ```bash
   pnpm dev:docker:clean
   rm -rf node_modules central-pet-*/node_modules
   pnpm install
   pnpm dev:docker
   ```

2. Abra uma issue no GitHub com:
   - Sistema operacional
   - Comando que executou
   - Erro completo

**🎉 Boa codificação!**
