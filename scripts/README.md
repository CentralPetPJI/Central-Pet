# Scripts de Infraestrutura

Scripts utilitários para gerenciar a infraestrutura do Central-Pet.

## 📋 Scripts Disponíveis

### `ensure-postgres.js` - Garantir PostgreSQL rodando

Script cross-platform (Linux/macOS/Windows) que garante que PostgreSQL está disponível antes de executar testes.

**Fluxo de decisão:**

```
┌────────────────────────────────────────┐
│ PostgreSQL rodando na porta 5432?      │
└─────────────┬──────────────────────────┘
              │
      ┌───────┴───────┐
      │ SIM           │ NÃO
      │               │
      ▼               ▼
┌─────────────┐  ┌────────────────────┐
│ É PostgreSQL?│  │ Docker disponível? │
└──────┬──────┘  └─────────┬──────────┘
       │                   │
   ┌───┴───┐          ┌────┴────┐
   │ SIM   │ NÃO      │ SIM     │ NÃO
   │       │          │         │
   ▼       ▼          ▼         ▼
┌──────┐ ┌───┐  ┌─────────┐ ┌──────────────┐
│ ✅    │ │❌ │  │ Daemon  │ │ ❌           │
│ OK   │ │   │  │ rodando?│ │ Instalar     │
└──────┘ └───┘  └────┬────┘ │ PostgreSQL   │
                     │      └──────────────┘
                 ┌───┴───┐
                 │ SIM   │ NÃO
                 │       │
                 ▼       ▼
            ┌─────────┐ ┌──────────────┐
            │ Iniciar │ │ ❌           │
            │ Docker  │ │ Iniciar      │
            └────┬────┘ │ Docker       │
                 │      └──────────────┘
                 ▼
            ┌──────────┐
            │ ✅ OK    │
            └──────────┘
```

**⚠️ IMPORTANTE:** PostgreSQL é OBRIGATÓRIO. Docker é apenas uma OPÇÃO para rodá-lo.

**Uso:**

```bash
node scripts/ensure-postgres.js
```

**Cenários suportados:**

1. ✅ PostgreSQL instalado localmente e rodando → Usa diretamente (IDEAL)
2. ✅ Container Docker já rodando → Usa diretamente
3. ✅ Docker instalado mas container parado → Inicia container
4. ❌ Porta 5432 ocupada por outro serviço → Erro
5. ❌ Sem PostgreSQL rodando E sem Docker → Erro (precisa instalar PostgreSQL)

### `pre-push-tests.sh` - Testes antes do push

Hook do Git que roda automaticamente antes de fazer push.

**O que faz:**

1. Garante que PostgreSQL está rodando (`ensure-postgres.js`)
2. Detecta quais arquivos foram modificados
3. Executa apenas os testes relevantes:
   - `test:front` - se mudou apenas frontend
   - `test:back` - se mudou apenas backend
   - `test:all` - se mudou ambos ou arquivos estruturais

**Uso:**
Executado automaticamente pelo Husky no `git push`. Pode ser executado manualmente:

```bash
sh scripts/pre-push-tests.sh
```

## 🎯 PostgreSQL: Local vs Docker

### ⚠️ Requisito Obrigatório

Você **PRECISA** ter PostgreSQL disponível. Pode ser:

- **PostgreSQL instalado localmente** (recomendado para desenvolvimento)
- **PostgreSQL via Docker** (útil para isolar o ambiente)

Docker **NÃO é obrigatório**, mas facilita o setup.

### Vantagens do PostgreSQL Local (Recomendado)

✅ **Mais rápido** - Sem overhead de container  
✅ **Menos recursos** - Não precisa do Docker Desktop  
✅ **Persistente** - Dados não são perdidos ao reiniciar  
✅ **Independente** - Funciona sem Docker

### Vantagens do PostgreSQL via Docker (Opcional)

✅ **Isolado** - Não interfere com outras instalações  
✅ **Fácil reset** - `docker compose down -v` limpa tudo  
✅ **Mesmo ambiente** - Garante paridade dev/prod  
✅ **Portável** - Mesmo setup em qualquer máquina

**Os scripts suportam ambos! Escolha o que preferir.** 🚀

## 🐛 Troubleshooting

### Erro: "Porta 5432 em uso, mas não é PostgreSQL"

Outro serviço está usando a porta 5432. Opções:

1. Parar o serviço que está usando a porta
2. Mudar a porta do PostgreSQL no `.env` e `docker-compose.dev.yml`

### Erro: "PostgreSQL não está instalado/rodando E Docker não está disponível"

**Você precisa instalar PostgreSQL.** Escolha uma das opções:

**OPÇÃO 1 - PostgreSQL Local (Recomendado):**

- **Windows:** https://www.postgresql.org/download/windows/
- **macOS:** `brew install postgresql@16 && brew services start postgresql@16`
- **Linux (Ubuntu/Debian):** `sudo apt install postgresql-16 && sudo systemctl start postgresql`

Após instalar, configure usuário e senha conforme seu `.env`.

**OPÇÃO 2 - Docker (Opcional):**

- Instale [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Execute: `docker compose -f docker-compose.dev.yml up -d postgres`

### Erro: "Docker daemon não está rodando"

1. **Windows/macOS:** Inicie o Docker Desktop
2. **Linux:** `sudo systemctl start docker`

## 📚 Outros Scripts

Os scripts específicos do backend ficam em `central-pet-back/scripts/`:

- `setup-dev-db.js` - Configura banco de desenvolvimento (.env)
- `setup-test-db.js` - Configura banco de dados de teste
- `setup-test-db.sh` - Versão Bash (legado)

Consulte `central-pet-back/scripts/README.md` para mais detalhes.
