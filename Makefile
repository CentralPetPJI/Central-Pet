.PHONY: dev dev-docker dev-down dev-logs dev-clean dev-status help

# Comando padrão quando digitar apenas 'make'
help:
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "  🐶 Central-Pet - Comandos Disponíveis 🐱"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "  make dev          🚀 Iniciar TUDO (frontend + backend + DB)"
	@echo "  make dev-status   📊 Ver status dos containers"
	@echo "  make dev-logs     📋 Ver logs em tempo real"
	@echo "  make dev-down     🛑 Parar containers"
	@echo "  make dev-clean    🧹 Limpar tudo (volumes + containers)"
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "Ou use: pnpm dev:docker"
	@echo ""

# Comando principal - inicia tudo automaticamente
dev: dev-docker

dev-docker:
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "🚀 Iniciando Central-Pet em modo desenvolvimento..."
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "  ✅ Frontend: http://localhost:5173"
	@echo "  ✅ Backend:  http://localhost:3000"
	@echo "  ✅ PostgreSQL: localhost:5432"
	@echo ""
	@echo "Aguarde... (primeira vez pode levar alguns minutos)"
	@echo ""
	docker compose -f docker-compose.dev.yml up --build

dev-status:
	@echo "📊 Status dos containers:"
	@docker compose -f docker-compose.dev.yml ps

dev-down:
	@echo "🛑 Parando containers..."
	docker compose -f docker-compose.dev.yml down

dev-logs:
	@echo "📋 Logs em tempo real (Ctrl+C para sair)..."
	docker compose -f docker-compose.dev.yml logs -f

dev-clean:
	@echo "🧹 Limpando containers e volumes..."
	docker compose -f docker-compose.dev.yml down -v
	@echo ""
	@echo "✅ Tudo limpo! Próximo 'make dev' criará do zero."
