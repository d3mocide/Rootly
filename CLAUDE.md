# Rootly — Claude Code Rules

## Project Overview

Rootly is a plant care management app: FastAPI (Python) backend + React 19 (TypeScript) frontend, containerised with Docker Compose. PostgreSQL for persistence, Redis for replay-attack prevention.

**Branch**: always develop on `claude/trusting-lovelace-H8BMf`. Commit and push when work is complete.

---

## Before Every Session

Run the linters before making any changes, and again before committing:

```bash
# TypeScript + ESLint
npm run lint
npx tsc --project tsconfig.app.json

# Python
cd api && flake8 . --max-line-length=120 --exclude=__pycache__,alembic/versions
```

Any new error introduced by your changes must be fixed before pushing.

---

## Architecture

See `.claude/architecture.md` for the full system diagram, service topology, and decision log.

### Quick map

| Layer | Path | Notes |
|---|---|---|
| API | `api/` | FastAPI, async SQLAlchemy, Alembic |
| Frontend | `src/` | React 19, Vite, TypeScript |
| DB models | `api/models/` | SQLAlchemy ORM |
| Schemas | `api/schemas/` | Pydantic v2 |
| Routes | `api/routes/` | `auth.py`, `plants.py`, `admin.py` |
| Auth helpers | `api/auth.py` | JWT + cookie logic |
| API client | `src/api/` | `client.ts`, `auth.ts`, `plants.ts` |
| Screens | `src/screens/` | `mobile/` and `desktop/` sub-dirs |
| Components | `src/components/index.tsx` | Shared UI primitives |
| Tokens | `src/tokens.ts` | Design token object `T` — import from here, NOT components |
| Types | `src/types/plant.ts` | `Plant`, `PlantStatus`, `STATUS_META` |

---

## Brand & UI Rules

See `.claude/brand.md` for the complete brand guide.

### Quick rules

- **Never** import `T` from `./components` or `../../components`. Import from `./tokens` or `../../tokens`.
- `components/index.tsx` must export **only React components** (react-refresh rule).
- Breakpoint: `700px`. Below = mobile tab layout. Above = sidebar + panel layout.
- All inline styles use values from `T`. No hard-coded hex colours unless they are status-specific (defined in `STATUS_META`).
- Font families: `T.sans` for body, `T.display` for headings, `T.mono` for numbers/code.
- Border radius pattern: `999` for pills/buttons, `18–20` for cards.
- Transitions: `all .18s cubic-bezier(.22,.61,.36,1)`.

---

## Auth System

See `.claude/auth.md` for the full auth flow.

### Quick rules

- Auth is **cookie-based** (HTTP-only). The backend sets `access_token` and `refresh_token` cookies. Never read/write auth cookies from JavaScript — the browser handles them automatically.
- `get_current_user` FastAPI dependency validates the cookie and returns the `User` ORM object. Use it on every protected route.
- Role check: use `require_role("admin")` dependency, not inline `if user.role != "admin"`.
- Never return `password_hash` in any response schema.
- All plant routes must check `Plant.user_id == current_user.id` — no cross-user access.

---

## Database Rules

See `.claude/database.md` for schema details and migration guidelines.

### Quick rules

- All migrations live in `api/alembic/versions/`. Never edit a committed migration — create a new one.
- Create migrations with `make migration "describe the change"`. Review the generated file before applying.
- Apply with `make migrate`. Rollback one step with `make downgrade`.
- Always use `await db.commit()` after writes; always `await db.refresh(obj)` before returning a newly created object.
- `email` uses PostgreSQL `CITEXT` — comparisons are case-insensitive at the DB level.
- Enum values are stored in the DB as lowercase strings matching the Python enum names.

---

## MPM (Module) Development

When building new MPM (Modular Plant Management) modules, read `.claude/architecture.md#mpm-modules` first. Each module follows the same four-layer pattern: DB model → Pydantic schemas → route file → frontend API client + screens.

Checklist for a new module:
- [ ] `api/models/<name>.py` — SQLAlchemy model with `user_id` FK
- [ ] `api/schemas/<name>.py` — `Create`, `Update`, `Response` schemas
- [ ] `api/routes/<name>.py` — router with ownership checks
- [ ] Register router in `api/main.py`
- [ ] `make migration "add <name> table"` — create and review migration
- [ ] `src/api/<name>.ts` — typed API client functions
- [ ] `src/types/<name>.ts` — TypeScript types mirroring the schema
- [ ] `src/screens/mobile/<Name>Screen.tsx` — mobile view
- [ ] `src/screens/desktop/<Name>Desktop.tsx` — desktop view
- [ ] Wire into `App.tsx` tab/sidebar navigation

---

## Dev Commands

```bash
make up             # Start all containers
make down           # Stop all containers
make build-prod     # Rebuild + start
make logs           # Tail API logs
make shell          # Bash into API container
make psql           # PostgreSQL CLI
make migrate        # Apply pending migrations
make migration "x"  # Generate new migration
make dev            # Frontend dev server (port 5173)
make nuke           # Destroy everything (asks confirmation)
```

---

## Commit Style

- Short imperative subject line (≤72 chars)
- Body: explain the *why*, not the what
- Include session URL on the last line
