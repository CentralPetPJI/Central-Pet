#!/usr/bin/env bash
#
# Script para setup inicial do banco de dados PostgreSQL em produção
#
# Uso no droplet:
#   1. Com banco externo (managed DB):
#      DATABASE_URL="postgresql://user:pass@host:5432/centralpetdb" ./scripts/setup-prod-db.sh
#
#   2. Com banco interno (docker-compose):
#      Carregar variáveis do .env.prod primeiro:
#      set -a && source .env.prod && set +a
#      ./scripts/setup-prod-db.sh
#

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Validar DATABASE_URL
if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Erro: DATABASE_URL não está definida." >&2
  echo "" >&2
  echo "Defina a variável antes de rodar:" >&2
  echo "  DATABASE_URL='postgresql://user:pass@host:5432/dbname' $0" >&2
  echo "" >&2
  echo "Ou carregue do .env.prod:" >&2
  echo "  set -a && source .env.prod && set +a" >&2
  echo "  $0" >&2
  exit 1
fi

echo ">> DATABASE_URL detectada (ocultando senha):"
echo "${DATABASE_URL}" | sed 's/:\/\/[^:]*:[^@]*@/:\/\/***:***@/'

echo ""
echo ">> Verificando conexão com o banco..."
if command -v psql &> /dev/null; then
  # Tenta conectar via psql se disponível
  if psql "${DATABASE_URL}" -c "SELECT 1" > /dev/null 2>&1; then
    echo "✓ Conexão bem-sucedida!"
  else
    echo "✗ Falha ao conectar. Verifique DATABASE_URL e credenciais." >&2
    exit 1
  fi
else
  echo "⚠ psql não encontrado, pulando verificação de conexão."
fi

echo ""
echo ">> Gerando Prisma Client..."
(
  cd "$ROOT_DIR/central-pet-back"
  pnpm exec prisma generate
)

echo ""
echo ">> Aplicando migrations do Prisma..."
(
  cd "$ROOT_DIR/central-pet-back"
  pnpm exec prisma migrate deploy
)

echo ""
echo ">> Status das migrations:"
(
  cd "$ROOT_DIR/central-pet-back"
  pnpm exec prisma migrate status
)

echo ""
echo "✓ Setup do banco concluído com sucesso!"
echo ""
echo "Próximos passos:"
echo "  1. Verifique se as tabelas foram criadas:"
echo "     psql \"\$DATABASE_URL\" -c '\\dt'"
echo ""
echo "  2. (Opcional) Popule dados iniciais se houver seed:"
echo "     pnpm --filter central-pet-back seed"
echo ""
echo "  3. Suba a aplicação:"
echo "     ./scripts/deploy-prod.sh up external-db"
