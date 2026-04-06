#!/usr/bin/env sh

set -eu

cd "$(git rev-parse --show-toplevel)"

# Garante que PostgreSQL está rodando antes de executar testes
echo "Validando infraestrutura..."
sh ./scripts/ensure-postgres.sh
echo ""

empty_tree="4b825dc642cb6eb9a060e54bf8d69288fbee4904"
changed_files="$(mktemp)"
trap 'rm -f "$changed_files"' EXIT
echo "Comparando refs locais e remotos para detectar arquivos modificados..."
while read -r local_ref local_sha remote_ref remote_sha; do
  echo  "aloc_ref: $local_ref, local_sha: $local_sha, remote_ref: $remote_ref, remote_sha: $remote_sha"
  if [ -z "${local_ref:-}" ] || [ -z "${local_sha:-}" ] || [ -z "${remote_sha:-}" ]; then
    continue
  fi

  if [ "$local_sha" = "0000000000000000000000000000000000000000" ]; then
    continue
  fi

  if [ "$remote_sha" = "0000000000000000000000000000000000000000" ]; then
    git diff --name-only "$empty_tree" "$local_sha" >> "$changed_files"
  else
    git diff --name-only "$remote_sha" "$local_sha" >> "$changed_files"
  fi
done

if [ ! -s "$changed_files" ]; then
  echo "[pre-push] Nenhuma mudanca detectada. Pulando testes."
  exit 0
fi

run_front=false
run_back=false
run_all=false

while IFS= read -r file; do
  case "$file" in
    central-pet-front/*)
      run_front=true
      ;;
    central-pet-back/*)
      run_back=true
      ;;
    package.json|pnpm-lock.yaml|pnpm-workspace.yaml|README.md|.husky/*|scripts/*|docker-compose*.yml|docker-compose*.yaml|central-pet-front/package.json|central-pet-back/package.json)
      run_all=true
      ;;
  esac
done <<EOF
$(sort -u "$changed_files")
EOF

if $run_all; then
  echo "[pre-push] Mudancas no front e no back. Rodando test:all."
  pnpm test:all
  exit 0
fi

if $run_front && $run_back; then
  echo "[pre-push] Mudancas no front e no back. Rodando test:all."
  pnpm test:all
  exit 0
fi

if $run_front; then
  echo "[pre-push] Mudancas no front. Rodando test:front."
  pnpm test:front
  exit 0
fi

if $run_back; then
  echo "[pre-push] Mudancas no back. Rodando test:back."
  pnpm test:back
  exit 0
fi

echo "[pre-push] Nenhuma mudanca relevante em front/back. Pulando testes."
