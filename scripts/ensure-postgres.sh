#!/usr/bin/env sh

set -eu

# Diretório do projeto
PROJECT_DIR="$(git rev-parse --show-toplevel)"

# Cores para output (usando tput para melhor portabilidade)
RED=$(tput setaf 1 2>/dev/null || echo '')
GREEN=$(tput setaf 2 2>/dev/null || echo '')
YELLOW=$(tput setaf 3 2>/dev/null || echo '')
NC=$(tput sgr0 2>/dev/null || echo '')

# Verifica se a porta 5432 está disponível ou já é PostgreSQL
check_postgres_port() {
  # Tenta conectar à porta 5432
  if timeout 2 bash -c "</dev/tcp/localhost/5432" 2>/dev/null; then
    # Porta está em uso, verifica se é PostgreSQL
    if command -v pg_isready &> /dev/null; then
      if pg_isready -h localhost -p 5432 -U centralpet > /dev/null 2>&1; then
        return 0  # PostgreSQL já está rodando localmente
      fi
    fi
    # Tenta com credenciais padrão
    if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
      return 0  # PostgreSQL está rodando (sem validar user)
    fi
    echo "${RED}❌ Porta 5432 em uso, mas não é PostgreSQL${NC}"
    exit 1
  fi
  return 1  # Porta livre
}

# Primeiro, valida se PostgreSQL já está rodando localmente (Docker ou não)
if check_postgres_port; then
  echo "${GREEN}✓ PostgreSQL já está rodando na porta 5432${NC}"
  exit 0
fi

# Verifica se Docker está instalado
if ! command -v docker &> /dev/null; then
  echo "${RED}❌ Docker não está instalado${NC}"
  exit 1
fi

echo "${GREEN}✓ Docker está instalado${NC}"

# Se não estiver, tenta via Docker
if ! docker info > /dev/null 2>&1; then
  echo "${RED}❌ Docker daemon não está rodando${NC}"
  exit 1
fi

echo "${GREEN}✓ Docker daemon está rodando${NC}"

cd "$PROJECT_DIR"

# Verifica se postgres container está rodando
if ! docker ps | grep -q "postgres\|centralpetdb"; then
  echo "${YELLOW}⚠️  PostgreSQL não está rodando. Iniciando container...${NC}"
  
  # Inicia apenas o postgres do docker-compose
  docker compose -f docker-compose.dev.yml up -d postgres
  
  # Aguarda o postgres ficar pronto
  echo "Aguardando PostgreSQL ficar pronto..."
  max_attempts=30
  attempt=0
  
  while ! docker exec "$(docker ps -q -f name=postgres)" pg_isready -U centralpet > /dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ $attempt -ge $max_attempts ]; then
      echo "${RED}❌ Timeout esperando PostgreSQL${NC}"
      exit 1
    fi
    printf "."
    sleep 1
  done
  
  echo ""
  echo "${GREEN}✓ PostgreSQL iniciado e pronto${NC}"
else
  echo "${GREEN}✓ PostgreSQL container já está rodando${NC}"
fi
