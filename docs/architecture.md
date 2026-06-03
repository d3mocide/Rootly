# Rootly — System Architecture

## Service Topology

```
Browser
  │
  ├─ GET /          → Nginx (port 80) → serves built React SPA
  │
  └─ fetch /api/*   → Nginx → FastAPI (uvicorn, internal port 8000)
                                  │
                         ┌────────┴─────────┐
                         │                  │
                    PostgreSQL 16       Redis 7
                    (port 5432)         (port 6379)
                    primary data        replay attack cache
```

All four services run as Docker Compose services on the same Docker network. The frontend container is Nginx serving the Vite production build; it reverse-proxies `/api/` to the `api` service.

---

## Service Responsibilities

### `frontend` (Nginx)
- Serves the compiled React SPA from `/usr/share/nginx/html`
- Proxies `/api/` to `http://api:8000/`
- Handles SPA routing: returns `index.html` for all non-asset paths

### `api` (FastAPI + uvicorn)
- All business logic and data access
- Async SQLAlchemy with `asyncpg` driver
- HTTP-only cookie auth (no tokens in JS)
- Three route groups: `/auth/*`, `/plants/*`, `/admin/*`

### `postgres` (PostgreSQL 16)
- Primary data store
- `CITEXT` extension for case-insensitive email comparison
- Custom `plantkind` and `plantstatus` enum types
- Managed via Alembic migrations

### `redis` (Redis 7)
- Replay attack prevention: SHA-256 hash of login request body stored with 10-min TTL
- Append-only persistence (`--appendonly yes`)

---

## Request Lifecycle (authenticated route)

```
1. Browser sends GET /api/plants
   └─ Cookie: access_token=<jwt> (set by browser automatically — HTTP-only)

2. Nginx proxies to FastAPI

3. get_current_user dependency:
   a. Reads access_token cookie
   b. Decodes JWT (HS256, JWT_SECRET)
   c. Checks type == "access" and not expired
   d. Queries DB for User by UUID sub claim
   e. Returns User ORM object

4. Route handler runs with User, performs queries scoped to user.id

5. Response serialised via Pydantic response_model
   └─ password_hash is never included
```

---

## Environment Variables

| Variable | Required | Default | Notes |
|---|---|---|---|
| `JWT_SECRET` | Yes | — | Must be long and random |
| `POSTGRES_PASSWORD` | Yes | — | PostgreSQL user password |
| `DATABASE_URL` | (auto) | composed in compose | `postgresql+asyncpg://...` |
| `REDIS_URL` | No | `redis://redis:6379` | |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `60` | |
| `REFRESH_TOKEN_EXPIRE_DAYS` | No | `7` | |
| `CORS_ORIGINS` | No | `""` | Comma-separated list |
| `PRODUCTION` | No | `false` | Enables `Secure` cookie flag, hides error details |

---

## Frontend Architecture

### State Model

```
App.tsx
├─ token          (string | null)   — drives auth/main split; NOT used in API calls
├─ currentUser    (UserResponse | null)
├─ plants         (Plant[])
├─ tab            (TabId)           — active navigation tab
├─ profile        (Plant | null)    — selected plant for detail view
└─ isDesktop      (boolean)         — from useBreakpoint(700)
```

The `token` state value is obtained from `getToken()` (localStorage) solely to decide whether to show the auth screen or main app. All actual API requests are authenticated via the HTTP-only cookie — the browser attaches it automatically.

### Layout Modes

```
< 700px  →  Tab layout
            TabBar (bottom) + tab screens: Today | Plants | Growth | Care
            Profile view replaces current screen (no modal)

≥ 700px  →  Sidebar layout
            Sidebar (left, fixed) + main panel (right, scrollable)
            ProfilePanel slides in from the right as an overlay
```

### Screen Inventory

| Screen | Mobile | Desktop |
|---|---|---|
| Auth | `AuthScreen` | same |
| Today | `TodayScreen` | `TodayDesktop` |
| Plants | `PlantsScreen` | `PlantsDesktop` |
| Plant detail | `ProfileScreen` | `ProfilePanel` |
| Growth | `GrowthScreen` | `PlaceholderDesktop` |
| Care | `CareScreen` | `PlaceholderDesktop` |
| Add plant | `AddPlantScreen` | (flash toast — full flow pending) |
| Water confirm | `WaterSheet` | (inline, no sheet) |

---

## MPM Modules

MPM (Modular Plant Management) is the pattern for extending Rootly with new care-related features. Each module is a self-contained vertical slice: DB → API → frontend. All modules follow the same four-layer pattern.

### When to use a new module

A new MPM module is appropriate when:
- The data belongs to a user (requires `user_id` FK)
- It has its own CRUD lifecycle independent of plants
- It will appear in the navigation (tab on mobile, sidebar item on desktop)

Examples of planned modules: schedules, growth journal, reminders, fertiliser log.

### Four-Layer Pattern

```
Layer 1: DB Model          api/models/<name>.py
Layer 2: Pydantic Schemas  api/schemas/<name>.py
Layer 3: Route file        api/routes/<name>.py
Layer 4: Frontend          frontend/src/api/<name>.ts
                           frontend/src/types/<name>.ts
                           frontend/src/screens/mobile/<Name>Screen.tsx
                           frontend/src/screens/desktop/<Name>Desktop.tsx
```

### Checklist for a new MPM module

**Backend**

- [ ] `api/models/<name>.py` — SQLAlchemy model
  - UUID primary key with `default=uuid.uuid4`
  - `user_id` FK to `users.id` (non-nullable)
  - `created_at = Column(DateTime, default=datetime.utcnow)`
  - Import in `api/alembic/env.py` so autogenerate detects it
- [ ] `api/schemas/<name>.py` — three schemas: `<Name>Create`, `<Name>Update`, `<Name>Response`
  - `Response` must include `id`, `user_id`, `created_at`
  - `Update` fields are all `Optional`
  - `model_config = ConfigDict(from_attributes=True)` on `Response`
- [ ] `api/routes/<name>.py` — FastAPI router
  - `prefix="/<names>"`, `tags=["<names>"]`
  - All routes: `user: User = Depends(get_current_user)`
  - All queries: `.where(Model.user_id == user.id)`
  - Register in `api/main.py`: `app.include_router(<name>_router)`
- [ ] `make migration "add <name> table"` — generate and review before applying
- [ ] `make migrate` — apply

**Frontend**

- [ ] `frontend/src/types/<name>.ts` — TypeScript types mirroring Pydantic response schema
- [ ] `frontend/src/api/<name>.ts` — typed API client using `apiFetch` from `./client`
  - Map snake_case API fields to camelCase if needed
  - Export: `fetch<Names>`, `apiCreate<Name>`, `apiUpdate<Name>`, `apiDelete<Name>`
- [ ] `frontend/src/screens/mobile/<Name>Screen.tsx` — mobile screen
- [ ] `frontend/src/screens/desktop/<Name>Desktop.tsx` — desktop panel
- [ ] Wire into `App.tsx`:
  - Add tab ID to `TabId` union in `TabBar.tsx`
  - Add `{tab === '<name>' && <...>}` render blocks for both layouts
  - Add sidebar item in `Sidebar.tsx`

### Module skeleton — backend

```python
# api/models/schedule.py
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from database import Base

class Schedule(Base):
    __tablename__ = "schedules"
    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name       = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
```

```python
# api/schemas/schedule.py
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class ScheduleCreate(BaseModel):
    name: str

class ScheduleUpdate(BaseModel):
    name: Optional[str] = None

class ScheduleResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    created_at: datetime
    model_config = {"from_attributes": True}
```

```python
# api/routes/schedule.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from auth import get_current_user
from database import get_db
from models.schedule import Schedule
from models.user import User
from schemas.schedule import ScheduleCreate, ScheduleUpdate, ScheduleResponse

router = APIRouter(prefix="/schedules", tags=["schedules"])

@router.get("", response_model=list[ScheduleResponse])
async def list_schedules(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Schedule).where(Schedule.user_id == user.id))
    return result.scalars().all()

@router.post("", response_model=ScheduleResponse, status_code=status.HTTP_201_CREATED)
async def create_schedule(body: ScheduleCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    obj = Schedule(**body.model_dump(), user_id=user.id)
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj
```

### Module skeleton — frontend

```typescript
// frontend/src/types/schedule.ts
export interface Schedule {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}
```

```typescript
// frontend/src/api/schedule.ts
import { apiFetch } from './client';
import type { Schedule } from '../types/schedule';

interface ApiSchedule {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

const fromApi = (s: ApiSchedule): Schedule => ({
  id: s.id,
  userId: s.user_id,
  name: s.name,
  createdAt: s.created_at,
});

export async function fetchSchedules(): Promise<Schedule[]> {
  const data: ApiSchedule[] = await apiFetch('/schedules');
  return data.map(fromApi);
}

export async function apiCreateSchedule(name: string): Promise<Schedule> {
  return fromApi(await apiFetch('/schedules', { method: 'POST', body: JSON.stringify({ name }) }));
}
```

---

## Decision Log

| Decision | Reason |
|---|---|
| Cookie-based auth (not Authorization header) | HTTP-only cookies prevent XSS token theft; works seamlessly with SameSite=Strict CSRF protection |
| Argon2id for passwords | State-of-the-art password hashing; resistant to GPU/ASIC attacks |
| Redis for replay prevention | Fast O(1) existence check; TTL-based expiry is native; no DB writes on login path |
| Async SQLAlchemy + asyncpg | Non-blocking I/O; FastAPI is async-first; avoids thread pool overhead |
| CITEXT for email | DB-level case insensitivity without application-level `.lower()` calls |
| Single 700px breakpoint | Simplicity; mobile-first with one well-defined desktop upgrade |
| Alembic for migrations | Industry standard for SQLAlchemy; autogenerate reduces boilerplate |
| Pydantic v2 settings | Validates env vars at startup; fails fast on misconfiguration |
