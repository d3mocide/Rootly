.PHONY: setup up down build build-dev build-prod nuke restart logs shell migrate migration downgrade psql redis dev fe-dev seed
SHELL := /bin/bash

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

prod:
	docker compose up -d --build

dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build

restart:
	docker compose restart api

logs:
	docker compose logs -f api

# ── Nuke everything (containers, volumes, images) ────────────────────────────
nuke:
	@echo "WARNING: This will delete all containers, volumes, and data."
	@read -p "Are you sure? [y/N] " confirm; \
	[ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ] || (echo "Aborted." && exit 1)
	docker compose down -v --rmi all --remove-orphans

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

seed:
	docker compose exec api python seed.py

# ── Frontend dev (runs Vite against a local API on port 8000) ─────────────────
fe-dev:
	npm --prefix frontend run dev
