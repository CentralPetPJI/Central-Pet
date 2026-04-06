# Guia de Deploy em Produção - Central Pet

Este guia cobre o setup completo do banco de dados e deploy da aplicação no droplet.

## 📋 Pré-requisitos

- Droplet com Docker e Docker Compose instalados
- PostgreSQL (managed DB ou via Docker)
- Acesso SSH ao droplet
- Variáveis de ambiente configuradas

---

## 🗄️ Setup do Banco de Dados

### Opção 1: Banco Externo (Managed Database - Recomendado)

Se você usa um banco gerenciado (DigitalOcean, AWS RDS, etc.):

```bash
# No droplet, após fazer upload do projeto

# 1. Configure a DATABASE_URL no .env.prod
echo 'DATABASE_URL="postgresql://user:password@host:5432/centralpetdb"' >> .env.prod

# 2. Rode o script de setup
./scripts/setup-prod-db.sh
```

**O que o script faz:**

- ✅ Valida a conexão com o banco
- ✅ Gera o Prisma Client com binários corretos para Linux
- ✅ Aplica todas as migrations (`prisma migrate deploy`)
- ✅ Mostra status final das migrations

---

### Opção 2: Banco Interno (Docker Compose)

Se você quer rodar PostgreSQL no próprio droplet via Docker:

```bash
# 1. Configure variáveis no .env.prod
cat >> .env.prod << 'EOF'
POSTGRES_DB=centralpetdb
POSTGRES_USER=centralpet
POSTGRES_PASSWORD=senha_super_segura_aqui

# DATABASE_URL deve usar o service name "postgres" do docker-compose
DATABASE_URL="postgresql://centralpet:senha_super_segura_aqui@postgres:5432/centralpetdb?schema=public"
EOF

# 2. Suba APENAS o banco primeiro
./scripts/deploy-prod.sh up internal-db postgres

# 3. Aguarde o banco ficar pronto (healthcheck)
docker compose --env-file .env.prod -f docker-compose.prod.yml --profile internal-db ps

# 4. Rode migrations
./scripts/setup-prod-db.sh

# 5. Suba o restante da aplicação
./scripts/deploy-prod.sh up internal-db
```

---

## 🚀 Deploy da Aplicação

### Fluxo Completo (primeira vez)

```bash
# === NO SEU COMPUTADOR LOCAL ===

# 1. Gere o pacote de deploy
cd /caminho/para/Central-Pet
./scripts/deploy-prod.sh bundle

# Isso cria: central-pet-prod.tar.gz


# === NO DROPLET ===

# 2. Faça upload do pacote
scp central-pet-prod.tar.gz user@centraupet.com.br:/app/

# 3. SSH no droplet
ssh user@centraupet.com.br

# 4. Descompacte
cd /app
tar -xzf central-pet-prod.tar.gz

# 5. Configure .env.prod (copie de .env.prod.example e edite)
cp .env.prod.example .env.prod
nano .env.prod  # Edite com valores reais

# 6. Setup do banco (escolha Opção 1 ou 2 acima)
./scripts/setup-prod-db.sh

# 7. Suba a aplicação
# Com banco externo:
./scripts/deploy-prod.sh up external-db

# Com banco interno:
./scripts/deploy-prod.sh up internal-db
```

---

### Atualizações (deploys subsequentes)

```bash
# === NO SEU COMPUTADOR LOCAL ===

# Gere novo pacote com código atualizado
./scripts/deploy-prod.sh bundle
scp central-pet-prod.tar.gz user@centraupet.com.br:/app/


# === NO DROPLET ===

cd /app

# 1. Backup do .env.prod atual
cp .env.prod .env.prod.backup

# 2. Descompacte nova versão
tar -xzf central-pet-prod.tar.gz

# 3. Restaure .env.prod
cp .env.prod.backup .env.prod

# 4. Aplique novas migrations (se houver)
./scripts/setup-prod-db.sh

# 5. Rebuild e restart dos containers
./scripts/deploy-prod.sh down external-db  # ou internal-db
./scripts/deploy-prod.sh up external-db    # ou internal-db
```

---

## 🔧 Variáveis de Ambiente Importantes

Edite `.env.prod` com estes valores:

```bash
# === Banco de Dados ===
DATABASE_URL="postgresql://user:password@host:5432/centralpetdb?schema=public"

# Apenas se usar internal-db:
POSTGRES_DB=centralpetdb
POSTGRES_USER=centralpet
POSTGRES_PASSWORD=sua_senha_aqui

# === Backend ===
FRONTEND_URL="https://centraupet.com.br"
NODE_ENV=production

# === Frontend ===
VITE_API_BASE_URL="https://centraupet.com.br/api"
VITE_AUTH_STRATEGY=production  # Não usar mock em produção!
VITE_DISPLAY_MOCK_CHOICE_GATE=false
```

---

## 🐛 Troubleshooting

### "Cannot find module 'express'" ou similar

**Causa:** Dependências não foram instaladas corretamente no build.

**Solução:**

```bash
# Rebuild forçado das imagens
./scripts/deploy-prod.sh down
docker system prune -af  # Remove caches antigos
./scripts/deploy-prod.sh up external-db  # Build do zero
```

---

### Migrations falhando

**Causa:** Banco não está acessível ou DATABASE_URL incorreta.

**Solução:**

```bash
# Teste a conexão
psql "$DATABASE_URL" -c "SELECT version();"

# Se falhar, verifique:
# - Host/porta corretos
# - Usuário/senha corretos
# - Firewall/Security Group permitindo conexão
# - Se usar docker interno: banco subiu? docker compose ps
```

---

### Backend não conecta no banco (docker internal)

**Causa:** Backend tentando conectar em `localhost` ao invés do service name.

**Solução:**

```bash
# DATABASE_URL deve usar "postgres" (nome do service):
DATABASE_URL="postgresql://user:pass@postgres:5432/centralpetdb"
#                                    ^^^^^^^^ service name, não localhost!
```

---

## 📊 Comandos Úteis

```bash
# Ver logs dos containers
docker compose --env-file .env.prod -f docker-compose.prod.yml logs -f

# Ver apenas logs do backend
docker compose --env-file .env.prod -f docker-compose.prod.yml logs -f back

# Status dos services
docker compose --env-file .env.prod -f docker-compose.prod.yml ps

# Restart de um service específico
./scripts/deploy-prod.sh down external-db back
./scripts/deploy-prod.sh up external-db back

# Acessar shell do container backend
docker compose --env-file .env.prod -f docker-compose.prod.yml exec back sh

# Verificar tabelas no banco
psql "$DATABASE_URL" -c '\dt'

# Ver migrations aplicadas
cd central-pet-back && pnpm exec prisma migrate status
```

---

## 🔐 Checklist de Segurança

Antes de colocar no ar:

- [ ] `VITE_AUTH_STRATEGY` diferente de `mock` em produção
- [ ] `VITE_DISPLAY_MOCK_CHOICE_GATE=false` em produção
- [ ] Senha forte no `POSTGRES_PASSWORD`
- [ ] DATABASE_URL com credenciais seguras
- [ ] Firewall configurado (apenas portas 80/443 abertas)
- [ ] SSL/TLS configurado no nginx
- [ ] Variáveis de ambiente não commitadas no Git
- [ ] Backup automático do banco configurado

---

## 📚 Referências

- [Prisma Migrations em Produção](https://www.prisma.io/docs/guides/deployment/deploy-database-changes-with-prisma-migrate)
- [Docker Compose Production Best Practices](https://docs.docker.com/compose/production/)
- [DigitalOcean Managed PostgreSQL](https://docs.digitalocean.com/products/databases/postgresql/)
