#!/usr/bin/env bash
#
# Build local e exportação de imagens Docker para o droplet
#
# Uso:
#   DROPLET_HOST=centraupet.com.br ./scripts/build-local-export-droplet.sh
#
# Variáveis de ambiente opcionais:
#   PLATFORM        - Plataforma alvo (padrão: linux/amd64)
#   TAG             - Tag da imagem (padrão: latest)
#   DROPLET_HOST    - Hostname do droplet (obrigatório para upload)
#   DROPLET_USER    - Usuário SSH (padrão: root)
#   SSH_PORT        - Porta SSH (padrão: 22)
#   SSH_KEY_PATH    - Caminho para chave SSH privada
#   DATABASE_URL    - URL do banco para o build (opcional, usa placeholder)
#   SAVE_IMAGES_ONLY - Se "true", apenas builda sem enviar
#
# Exemplos:
#   # Build local para testes
#   SAVE_IMAGES_ONLY=true ./scripts/build-local-export-droplet.sh
#
#   # Build e upload para droplet ARM64
#   PLATFORM=linux/arm64 DROPLET_HOST=centraupet.com.br ./scripts/build-local-export-droplet.sh
#

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

TAG="${TAG:-latest}"
BACK_IMAGE_NAME="${BACK_IMAGE_NAME:-central-pet-back}"
FRONT_IMAGE_NAME="${FRONT_IMAGE_NAME:-central-pet-front}"
BACK_IMAGE="${BACK_IMAGE_NAME}:${TAG}"
FRONT_IMAGE="${FRONT_IMAGE_NAME}:${TAG}"
PLATFORM="${PLATFORM:-linux/amd64}"

DROPLET_USER="${DROPLET_USER:-root}"
DROPLET_HOST="${DROPLET_HOST:-}"
SSH_PORT="${SSH_PORT:-22}"
SSH_KEY_PATH="${SSH_KEY_PATH:-}"

SSH_ARGS=(-p "$SSH_PORT")
if [[ -n "$SSH_KEY_PATH" ]]; then
  SSH_ARGS+=(-i "$SSH_KEY_PATH")
fi

echo ">> Build da imagem backend: ${BACK_IMAGE} (platform: ${PLATFORM})"
(
  cd "$ROOT_DIR"
  docker buildx build \
    --platform "$PLATFORM" \
    --load \
    -f central-pet-back/Dockerfile \
    -t "$BACK_IMAGE" \
    --build-arg "DATABASE_URL=${DATABASE_URL:-postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public}" \
    .
)

echo ">> Build da imagem frontend: ${FRONT_IMAGE} (platform: ${PLATFORM})"
(
  cd "$ROOT_DIR"
  docker buildx build \
    --platform "$PLATFORM" \
    --load \
    -f central-pet-front/Dockerfile \
    -t "$FRONT_IMAGE" \
    .
)

if [[ "${SAVE_IMAGES_ONLY:-}" == "true" ]]; then
  echo ">> Imagens construídas localmente. Use SAVE_IMAGES_ONLY=true para salvar as imagens sem enviá-las."
  exit 0
fi

if [[ -z "$DROPLET_HOST" ]]; then
  echo "Defina DROPLET_HOST para enviar as imagens via SSH." >&2
  exit 1
fi

echo ">> Enviando imagem backend por stream (docker save | docker load)"
docker save "$BACK_IMAGE" | ssh "${SSH_ARGS[@]}" "${DROPLET_USER}@${DROPLET_HOST}" "docker load"

echo ">> Enviando imagem frontend por stream (docker save | docker load)"
docker save "$FRONT_IMAGE" | ssh "${SSH_ARGS[@]}" "${DROPLET_USER}@${DROPLET_HOST}" "docker load"

echo "Imagens carregadas com sucesso no droplet."
echo "Use estes valores no docker-compose.prebuilt:"
echo "  BACK_IMAGE=${BACK_IMAGE}"
echo "  FRONT_IMAGE=${FRONT_IMAGE}"
