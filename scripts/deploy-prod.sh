#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARCHIVE_NAME="${ARCHIVE_NAME:-central-pet-prod.tar.gz}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-.env.prod}"
DB_MODE="${DB_MODE:-external-db}"

usage() {
  cat <<'EOF'
Uso:
  ./scripts/deploy-prod.sh bundle
  ./scripts/deploy-prod.sh unpack
  ./scripts/deploy-prod.sh up [internal-db|external-db] [service]
  ./scripts/deploy-prod.sh down [internal-db|external-db] [service]

Comandos:
  bundle  Gera um .tar.gz com apenas os arquivos necessarios para deploy.
  unpack  Descompacta o pacote de deploy no diretorio atual.
  up      Sobe o ambiente de producao com docker compose.
  down    Derruba o ambiente de producao.

Services opcionais:
  front
  back
  postgres

Variaveis opcionais:
  ARCHIVE_NAME  Nome do arquivo gerado no comando bundle.
  COMPOSE_FILE  Arquivo compose de producao. Padrao: docker-compose.prod.yml
  ENV_FILE      Arquivo de ambiente usado no compose. Padrao: .env.prod
  DB_MODE       Modo de banco: internal-db ou external-db. Padrao: external-db
EOF
}

require_file() {
  local path="$1"

  if [[ ! -e "$ROOT_DIR/$path" ]]; then
    echo "Arquivo obrigatorio nao encontrado: $path" >&2
    exit 1
  fi
}

unpack() {
  require_file "$ARCHIVE_NAME"
  (
    cd "$ROOT_DIR"
    tar -xzf "$ARCHIVE_NAME"
  )

  echo "Pacote descompactado em: $ROOT_DIR"
  echo "Proximo passo:"
  echo "  ./scripts/deploy-prod.sh up [internal-db|external-db]"
}

compose_args() {
  local mode="${1:-$DB_MODE}"

  case "$mode" in
    internal-db)
      echo "--env-file $ENV_FILE -f $COMPOSE_FILE --profile internal-db"
      ;;
    external-db)
      echo "--env-file $ENV_FILE -f $COMPOSE_FILE"
      ;;
    *)
      echo "Modo de banco invalido: $mode" >&2
      echo "Use internal-db ou external-db." >&2
      exit 1
      ;;
  esac
}

bundle() {
  require_file "$COMPOSE_FILE"
  require_file "$ENV_FILE"
  require_file ".env.prod.example"
  require_file ".dockerignore"
  require_file "package.json"
  require_file "pnpm-lock.yaml"
  require_file "pnpm-workspace.yaml"
  require_file "central-pet-front/Dockerfile"
  require_file "central-pet-back/Dockerfile"
  require_file "scripts/deploy-prod.sh"

  (
    cd "$ROOT_DIR"
    tar -czf "$ARCHIVE_NAME" \
      "$COMPOSE_FILE" \
      "$ENV_FILE" \
      .env.prod.example \
      .dockerignore \
      package.json \
      pnpm-lock.yaml \
      pnpm-workspace.yaml \
      central-pet-front \
      central-pet-back \
      scripts/deploy-prod.sh
  )

  echo "Pacote gerado em: $ROOT_DIR/$ARCHIVE_NAME"
}

up() {
  local mode="${1:-$DB_MODE}"
  local service="${2:-}"
  require_file "$COMPOSE_FILE"
  require_file "$ENV_FILE"
  (
    cd "$ROOT_DIR"
    # shellcheck disable=SC2086
    if [[ -n "$service" ]]; then
      docker compose $(compose_args "$mode") up --build -d "$service"
    else
      docker compose $(compose_args "$mode") up --build -d
    fi
  )
}

down() {
  local mode="${1:-$DB_MODE}"
  local service="${2:-}"
  require_file "$COMPOSE_FILE"
  require_file "$ENV_FILE"
  (
    cd "$ROOT_DIR"
    # shellcheck disable=SC2086
    if [[ -n "$service" ]]; then
      docker compose $(compose_args "$mode") stop "$service"
      docker compose $(compose_args "$mode") rm -f "$service"
    else
      docker compose $(compose_args "$mode") down
    fi
  )
}

main() {
  local command="${1:-}"
  local mode="${2:-}"
  local service="${3:-}"

  if [[ "$mode" != "" && "$mode" != "internal-db" && "$mode" != "external-db" ]]; then
    service="$mode"
    mode=""
  fi

  case "$command" in
    bundle)
      bundle
      ;;
    unpack)
      unpack
      ;;
    up)
      up "$mode" "$service"
      ;;
    down)
      down "$mode" "$service"
      ;;
    *)
      usage
      exit 1
      ;;
  esac
}

main "$@"
