#!/bin/bash

# Script para criar banco de dados de teste
# Deve ser executado antes dos testes E2E

set -e

echo "🔧 Configurando banco de dados de teste..."

# Carrega variáveis do .env.test
if [ ! -f .env.test ]; then
  echo "❌ Arquivo .env.test não encontrado!"
  exit 1
fi

# Extrai informações do DATABASE_URL
DATABASE_URL=$(grep DATABASE_URL .env.test | cut -d '=' -f2)

# Parse da URL (formato: postgresql://user:pass@host:port/dbname?schema=public)
DB_USER=$(echo $DATABASE_URL | sed -n 's|.*://\([^:]*\):.*|\1|p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's|.*@\([^:]*\):.*|\1|p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's|.*/\([^?]*\).*|\1|p')

echo "📦 Banco: $DB_NAME"
echo "🖥️  Host: $DB_HOST:$DB_PORT"
echo "👤 User: $DB_USER"

# Verifica se PostgreSQL está acessível
echo "🔍 Verificando conexão com PostgreSQL..."
if ! PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c '\q' 2>/dev/null; then
  echo "❌ Não foi possível conectar ao PostgreSQL"
  echo "   Certifique-se de que o PostgreSQL está rodando e acessível"
  exit 1
fi

# Cria o banco se não existir
echo "🗄️  Criando banco de teste (se não existir)..."
PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME"

# Executa migrations
echo "🚀 Executando migrations..."
DATABASE_URL=$DATABASE_URL pnpm exec prisma migrate deploy

echo "✅ Banco de teste configurado com sucesso!"
