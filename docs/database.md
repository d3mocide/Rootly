# Rootly — Database Guidelines

## Schema Overview

```
users
├─ id              UUID          PK, default uuid4
├─ email           CITEXT        UNIQUE, NOT NULL, indexed
├─ password_hash   TEXT          NOT NULL
├─ display_name    TEXT          nullable
├─ role            VARCHAR(20)   NOT NULL, default 'operator'
├─ created_at      TIMESTAMPTZ   default now()
├─ last_login_at   TIMESTAMPTZ   nullable
└─ is_password_temp BOOLEAN      NOT NULL, default false

plants
├─ id              UUID          PK, default uuid4
├─ user_id         UUID          FK → users.id, NOT NULL
├─ name            TEXT          NOT NULL
├─ species         TEXT          NOT NULL, default ''
├─ kind            plantkind     NOT NULL (enum)
├─ room            TEXT          NOT NULL, default ''
├─ moisture        FLOAT         NOT NULL, default 0.5
├─ status          plantstatus   NOT NULL, default 'thriving'
├─ every           INTEGER       NOT NULL, default 7 (days between watering)
├─ light           TEXT          NOT NULL, default ''
├─ note            TEXT          NOT NULL, default ''
├─ growth          JSON          NOT NULL, default [] (array of float readings)
├─ last_water      TIMESTAMP     nullable
└─ created_at      TIMESTAMP     default now()
```

---

## Enum Types

Both enums are PostgreSQL native types stored as lowercase strings.

### `plantkind`
| Value | Meaning |
|---|---|
| `monstera` | Monstera deliciosa |
| `fig` | Fiddle leaf fig |
| `pothos` | Pothos |
| `snake` | Snake plant |
| `succulent` | Succulent / cactus |

### `plantstatus`
| Value | Meaning | Colour |
|---|---|---|
| `dry` | Needs water now | `#BC5B49` |
| `soon` | Due within 1–2 days | `#C9852F` |
| `thriving` | Well-watered, healthy | `#3E8E5A` |
| `watered` | Watered today | `#5E8FB8` |
| `resting` | Dormant / seasonal rest | `#7C857B` |

---

## Extensions

The initial migration enables the `citext` PostgreSQL extension:

```sql
CREATE EXTENSION IF NOT EXISTS citext;
```

`email` is typed as `CITEXT` so all equality comparisons are case-insensitive at the database level — no `.lower()` needed in application code.

---

## SQLAlchemy Patterns

### Session lifecycle

Always use `await db.commit()` after writes. Always `await db.refresh(obj)` before returning a newly created object so that server-generated columns (id, created_at) are populated.

```python
# Create
obj = MyModel(**body.model_dump(), user_id=user.id)
db.add(obj)
await db.commit()
await db.refresh(obj)   # populates id, created_at
return obj

# Update
for key, value in body.model_dump(exclude_none=True).items():
    setattr(obj, key, value)
await db.commit()
await db.refresh(obj)
return obj

# Delete
await db.delete(obj)
await db.commit()
```

### Ownership checks

Every query against user-owned data must filter by `user_id`. Never trust a path parameter alone.

```python
result = await db.execute(
    select(Plant).where(Plant.id == plant_id, Plant.user_id == user.id)
)
plant = result.scalar_one_or_none()
if not plant:
    raise HTTPException(status_code=404, detail="Plant not found")
```

### Async session injection

Use the `get_db` dependency. Never create a session manually inside a route.

```python
from database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

async def my_route(db: AsyncSession = Depends(get_db)):
    ...
```

---

## Migration Workflow

All migrations live in `api/alembic/versions/`. Migration files are append-only — never edit a committed migration.

### Creating a migration

```bash
make migration "describe the change"
# Runs: alembic revision --autogenerate -m "describe the change"
```

After generating, **always review the file** before applying. Autogenerate is not always correct — it may miss `CITEXT` columns, custom types, or index changes.

### Applying migrations

```bash
make migrate
# Runs: alembic upgrade head
```

### Rolling back

```bash
make downgrade
# Runs: alembic downgrade -1
```

### Common autogenerate pitfalls

| Situation | What to do |
|---|---|
| New PostgreSQL enum type | Add `op.execute("CREATE TYPE ...")` before the table creation; use `create_type=False` in Column definition to avoid duplicate creation |
| `CITEXT` column | Autogenerate will produce `TEXT`; manually change to `sa.Text()` and add `op.execute("ALTER TABLE ... ALTER COLUMN ... TYPE CITEXT USING ...::citext")` |
| Index on CITEXT | Add `op.create_index(...)` manually — autogenerate may miss it |
| Renaming a column | Autogenerate sees this as drop + add, losing data; write the `op.alter_column` manually |

### Registering new models

When adding a new model, import it in `api/alembic/env.py` so that autogenerate can detect it:

```python
# api/alembic/env.py
import models.user   # noqa
import models.plant  # noqa
import models.your_new_model  # noqa  ← add this
```

---

## Adding a New Table (MPM Module Pattern)

1. Create `api/models/<name>.py` with a `user_id` FK.
2. Import it in `api/alembic/env.py`.
3. Run `make migration "add <name> table"`.
4. Open the generated file in `api/alembic/versions/` and verify correctness.
5. Run `make migrate`.

### Template

```python
# api/models/example.py
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from database import Base

class Example(Base):
    __tablename__ = "examples"
    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name       = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
```

---

## Connection & Configuration

The database URL is set via the `DATABASE_URL` env var. FastAPI uses the `+asyncpg` driver; Alembic strips it back to `+psycopg2` for synchronous migrations:

```python
# api/alembic/env.py
_db_url = os.environ["DATABASE_URL"].replace("postgresql+asyncpg://", "postgresql://", 1)
```

Connection settings in `api/database.py`:
- `pool_pre_ping=True` — validates connections before use, handles stale connections after restarts
- `expire_on_commit=False` on the session maker — prevents "Instance is detached" errors on async sessions

---

## Data Rules Summary

- `email` is always CITEXT — comparisons are case-insensitive at DB level
- All enum values are lowercase strings matching Python enum member names
- `password_hash` must never appear in any Pydantic response schema
- `user_id` is required on every user-owned table — no global/shared rows
- UUIDs are used everywhere as primary keys — no integer sequences
- `growth` is a JSON array of floats — ordered oldest to newest
