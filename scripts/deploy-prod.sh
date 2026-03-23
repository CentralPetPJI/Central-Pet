#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARCHIVE_NAME="${ARCHIVE_NAME:-central-pet-prod.tar.gz}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"

usage() {
  cat <<'EOF'
Uso:
  ./scripts/deploy-prod.sh bundle
  ./scripts/deploy-prod.sh up
  ./scripts/deploy-prod.sh down

Comandos:
  bundle  Gera um .tar.gz com apenas os arquivos necessarios para deploy.
  up      Sobe o ambiente de producao com docker compose.
  down    Derruba o ambiente de producao.

Variaveis opcionais:
  ARCHIVE_NAME  Nome do arquivo gerado no comando bundle.
  COMPOSE_FILE  Arquivo compose de producao. Padrao: docker-compose.prod.yml
EOF
}

require_file() {
  local path="$1"

  if [[ ! -e "$ROOT_DIR/$path" ]]; then
    echo "Arquivo obrigatorio nao encontrado: $path" >&2
    exit 1
  fi
}

bundle() {
  require_file "$COMPOSE_FILE"
  require_file ".dockerignore"
  require_file "package.json"
  require_file "pnpm-lock.yaml"
  require_file "pnpm-workspace.yaml"
  require_file "central-pet-front/Dockerfile"
  require_file "scripts/deploy-prod.sh"

  (
    cd "$ROOT_DIR"
    tar -czf "$ARCHIVE_NAME" \
      "$COMPOSE_FILE" \
      .dockerignore \
      package.json \
      pnpm-lock.yaml \
      pnpm-workspace.yaml \
      central-pet-front \
      scripts/deploy-prod.sh
  )

  echo "Pacote gerado em: $ROOT_DIR/$ARCHIVE_NAME"
}

up() {
  require_file "$COMPOSE_FILE"
  (
    cd "$ROOT_DIR"
    docker compose -f "$COMPOSE_FILE" up --build -d
  )
}

down() {
  require_file "$COMPOSE_FILE"
  (
    cd "$ROOT_DIR"
    docker compose -f "$COMPOSE_FILE" down
  )
}

main() {
  local command="${1:-}"

  case "$command" in
    bundle)
      bundle
      ;;
    up)
      up
      ;;
    down)
      down
      ;;
    *)
      usage
      exit 1
      ;;
  esac
}

main "$@"
