<div align="center">
  <img src="frontend/public/rootly-mark.svg" alt="Rootly" width="72" />
  <h1>Rootly</h1>
  <p><em>Tend your plants. Grow at your own pace.</em></p>
</div>

---

Rootly is a calm, personal plant care companion. It keeps track of your collection, reminds you when things are thirsty, and grows with you over time — without the noise of a productivity app.

Built for the people who talk to their plants.

---

## What it does

- **Today view** — see exactly which plants need attention right now
- **Plant collection** — your full roster, each with moisture, status, and care rhythm
- **Watering log** — one tap to record, with a quiet confirmation: *Logged. Monstera watered today.*
- **Growth tracking** — moisture readings over time, charted simply
- **Care notes** — light requirements, special notes, seasonal rest

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Backend | FastAPI, async SQLAlchemy |
| Database | PostgreSQL 16 with CITEXT |
| Cache | Redis 7 |
| Auth | HTTP-only JWT cookies, Argon2id |
| Container | Docker Compose |

---

## Getting started

**Requirements**: Docker and Docker Compose.

```bash
# 1. Clone the repo
git clone https://github.com/d3mocide/rootly.git
cd rootly

# 2. Create your environment file
cp .env.example .env
```

Open `.env` and set two values:

```env
JWT_SECRET=a-long-random-string-at-least-32-characters
POSTGRES_PASSWORD=your-database-password
```

```bash
# 3. Start everything
make setup
```

Open [http://localhost](http://localhost) in your browser. You'll be prompted to create the first admin account.

---

## Dev commands

```bash
make up          # Start all containers
make down        # Stop all containers
make logs        # Tail API logs
make shell       # Bash into the API container
make psql        # PostgreSQL CLI
make migrate     # Apply pending migrations
make migration   # Generate a new migration
make dev         # Frontend dev server (port 5173, hot reload)
make nuke        # Destroy everything and start fresh
```

For frontend development with hot reload, start the containers then run the Vite dev server:

```bash
make up
make dev
```

The Vite server at [http://localhost:5173](http://localhost:5173) proxies API requests to the running containers.

---

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `JWT_SECRET` | Yes | — | Secret for signing tokens. Must be long and random. |
| `POSTGRES_PASSWORD` | Yes | — | PostgreSQL user password |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `60` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRE_DAYS` | No | `7` | Refresh token lifetime |
| `CORS_ORIGINS` | No | `""` | Comma-separated allowed origins |
| `PRODUCTION` | No | `false` | Enables `Secure` cookie flag and hides error details |

---

## Project structure

```
rootly/
├── api/                    FastAPI backend
│   ├── models/             SQLAlchemy ORM models
│   ├── schemas/            Pydantic request/response schemas
│   ├── routes/             Route handlers (auth, plants, admin)
│   ├── alembic/            Database migrations
│   └── main.py             App entry point
├── frontend/               React frontend
│   ├── src/                Source files
│   │   ├── api/            API client functions
│   │   ├── screens/        Mobile and desktop screen components
│   │   │   ├── mobile/
│   │   │   └── desktop/
│   │   ├── components/     Shared UI primitives
│   │   ├── types/          TypeScript types
│   │   └── tokens.ts       Design tokens (colours, fonts)
│   ├── public/             Static assets
│   ├── Dockerfile          Production Dockerfile
│   ├── Dockerfile.dev      Development Dockerfile
│   ├── vite.config.ts      Vite configuration
│   └── package.json        NPM dependencies
├── docs/                   Project documentation
│   ├── architecture.md     System diagram, MPM module pattern
│   ├── auth.md             Auth flow and security rules
│   ├── brand.md            Brand guide, colours, typography
│   └── database.md         Schema, migration workflow
├── docker-compose.yml
└── Makefile
```

---

## Documentation

In-depth guides live in `docs/`:

- [`docs/architecture.md`](docs/architecture.md) — system topology, frontend architecture, MPM module pattern
- [`docs/auth.md`](docs/auth.md) — cookie-based auth flow, JWT, security checklist
- [`docs/brand.md`](docs/brand.md) — colour palette, typography, component rules
- [`docs/database.md`](docs/database.md) — schema, migration workflow, query patterns

---

<div align="center">
  <sub>Grow from the root up.</sub>
</div>
