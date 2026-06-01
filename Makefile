.PHONY: setup up down build restart logs shell migrate migration downgrade psql redis dev

# ── First-time setup ──────────────────────────────────────────────────────────
setup:
	@test -f .env || (cp .env.example .env && \
		echo "" && \
		echo "  Created .env from .env.example." && \
		echo "  Open .env and set SECRET_KEY and POSTGRES_PASSWORD, then run 'make setup' again." && \
		echo "" && \
		exit 1)
	docker compose up -d --build
	@echo ""
	@echo "  Rootly is running at http://localhost"
	@echo "  Open it in your browser to create the admin account."
	@echo ""

# ── Docker lifecycle ──────────────────────────────────────────────────────────
up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose up -d --build

restart:
	docker compose restart api

logs:
	docker compose logs -f api

# ── Database migrations ───────────────────────────────────────────────────────
migrate:
	docker compose exec api alembic upgrade head

migration:
	@read -p "Migration message: " msg; \
	docker compose exec api alembic revision --autogenerate -m "$$msg"

downgrade:
	docker compose exec api alembic downgrade -1

# ── Utility shells ────────────────────────────────────────────────────────────
shell:
	docker compose exec api bash

psql:
	docker compose exec postgres psql -U rootly rootly

redis:
	docker compose exec redis redis-cli

# ── Frontend dev (runs Vite against a local API on port 8000) ─────────────────
dev:
	npm run dev
