# ❓ FAQ - Perguntas Frequentes

## 🔧 Setup e Instalação

### Preciso ter Docker instalado?

**Não.** Docker é opcional mas recomendado. Você pode rodar localmente com PostgreSQL instalado no seu sistema.

### Qual é realmente obrigatório?

- Node.js 24+
- pnpm
- **PostgreSQL** (local OU via Docker)

### Como instalo PostgreSQL localmente?

- **Windows:** https://www.postgresql.org/download/windows/
- **macOS:** `brew install postgresql@16`
- **Linux:** `sudo apt install postgresql-16`

---

## 🚀 Desenvolvimento

### Como rodo o projeto sem Docker?

```bash
# 1. Certifique-se que PostgreSQL está rodando
# 2. Ajuste o central-pet-back/.env.development se necessário
# 3. Execute:
pnpm dev
```

### Docker vs Local: qual usar?

- **Docker:** Mais fácil, isolado, mesmo ambiente para todos
- **Local:** Mais rápido, menos recursos, melhor para debug

Use o que preferir! Ambos funcionam.

### Como mudo entre mock auth e sessão?

Edite `central-pet-front/.env.development`:
`VITE_AUTH_STRATEGY=mock` (padrão, mais fácil)
`VITE_AUTH_STRATEGY=session`

---

## 🧪 Testes

### É melhor rodar testes pela pasta root?

**Sim, recomendado.** Pelo root os scripts já cuidam da ordem e da configuração automaticamente (incluindo setup do banco de teste no backend).

```bash
# Backend (unit + e2e, com setup automático)
pnpm test:back

# Tudo (back + front + e2e)
pnpm test:all
```

### Como configuro os testes pela primeira vez?

```bash
pnpm test:back
```

### Os testes E2E precisam de Chrome instalado?

**Não.** O Playwright baixa seu próprio Chromium automaticamente.

### Testes estão falhando com erro de conexão

PostgreSQL não está rodando. Execute:

```bash
# Com Docker
pnpm dev:docker

# Sem Docker (inicie PostgreSQL manualmente primeiro)
cd central-pet-back && pnpm test:setup
```

---

## 🐛 Problemas Comuns

### "Port 5432 already in use"

Outra instância do PostgreSQL está rodando. Opções:

1. Use o PostgreSQL que já está rodando (ajuste `.env.development`)
2. Pare o outro PostgreSQL
3. Mude a porta no docker-compose.dev.yml

### "Permission denied" no banco

Seu usuário PostgreSQL não tem permissões. Execute:

```bash
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE centralpetdb TO centralpet;"
```

### "Module not found" depois de git pull

Dependências foram atualizadas. Execute:

```bash
pnpm install
```

### Hot reload não funciona

- **Docker:** Volumes estão montados? Verifique docker-compose.dev.yml
- **Local:** Reinicie o servidor

---

## 📂 Estrutura

### Onde fica o código do backend?

`central-pet-back/src/modules/` - Organizado por feature

### Onde fica o código do frontend?

`central-pet-front/src/Pages/` - Páginas principais
`central-pet-front/src/Components/` - Componentes reutilizáveis

### Onde ficam os testes E2E?

`tests/e2e/` - Testes end-to-end com Playwright

---

## 🔑 Autenticação

### Como faço login em desenvolvimento?

- **Mock (`VITE_AUTH_STRATEGY=mock`)**: não exige credenciais reais. Use o seletor de usuário mock na interface.
- **Sessão (`VITE_AUTH_STRATEGY=session`)**: use login/cadastro normal (email e senha), com sessão por cookie.

### Quais são os usuários disponíveis?

No modo mock, os usuários vêm do backend:

- Endpoint: `/api/mock-auth/mock-users`
- Seed: `central-pet-back/src/mocks/users.mock.ts`

---

## 🗄️ Banco de Dados

### Como vejo os dados no banco?

```bash
cd central-pet-back
pnpm prisma:studio
```

Abre interface visual em http://localhost:5555

### Como crio uma migration?

```bash
cd central-pet-back
pnpm prisma migrate dev --name nome_da_migration
```

### Como reseto o banco?

```bash
# Com Docker
pnpm dev:docker:clean && pnpm dev:docker

# Sem Docker
cd central-pet-back
pnpm prisma migrate reset
```

---

## 🪟 Windows Específico

### Scripts .sh não funcionam

Use os comandos do package.json em vez dos scripts bash:

```bash
# Em vez de: ./scripts/ensure-postgres.sh
node scripts/ensure-postgres.js
```

### PowerShell dá erro de execução

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 🐧 Linux Específico

### Erro "EACCES" ao instalar pnpm global

```bash
# Use sem sudo:
npm install -g pnpm --prefix ~/.local

# Adicione ao PATH:
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
```

### Docker requer sudo

Adicione seu usuário ao grupo docker:

```bash
sudo usermod -aG docker $USER
# Depois, faça logout e login novamente
```

---

## 📝 Contribuição

### Como rodo o linter?

```bash
pnpm --filter central-pet-front lint
pnpm --filter central-pet-back lint
```

### Commit foi rejeitado (pre-commit hook)

O Husky roda lint automaticamente. Corrija os erros e tente novamente:

```bash
# Ver erros
git status

# Corrigir
pnpm --filter <workspace> lint --fix

# Tentar novamente
git commit -m "..."
```

### Como rodo apenas os testes do que mudei?

Os hooks de pre-push detectam automaticamente! Só dê `git push`.

---

## 🆘 Ainda com problemas?

1. **Limpeza completa:**

   ```bash
   pnpm dev:docker:clean
   rm -rf node_modules */node_modules
   pnpm install
   pnpm dev:docker
   ```

2. **Abra uma issue:** https://github.com/CentralPetPJI/Central-Pet/issues
   - Descreva o problema
   - Cole o erro completo
   - Informe seu SO (Windows/Linux/macOS)
