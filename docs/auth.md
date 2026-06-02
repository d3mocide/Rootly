# Rootly — Auth System

## Overview

Auth is **cookie-based**. The FastAPI backend sets two HTTP-only cookies on login. The browser sends them automatically on every request. JavaScript never touches the cookie values.

```
Browser → POST /auth/login → Server sets:
  access_token  (HTTP-only, 60 min)
  refresh_token (HTTP-only, 7 days)
```

---

## Cookie Attributes

| Attribute | Value | Reason |
|---|---|---|
| `HttpOnly` | True | JS cannot read the token — prevents XSS theft |
| `Secure` | `settings.production` | HTTPS-only in prod; relaxed for local dev |
| `SameSite` | Strict | Prevents CSRF; cookie only sent on same-origin requests |

---

## Token Structure (JWT HS256)

```python
payload = {
    "sub": str(user_id),         # UUID as string
    "type": "access" | "refresh",
    "exp": datetime.now(UTC) + timedelta(...)
}
```

**Algorithm**: HS256 (HMAC-SHA256)
**Secret**: `settings.jwt_secret` — required, no default, must be long and random

---

## Authentication Flow

### First Run (Setup)

```
GET /auth/setup-status  →  { setup_required: true }
POST /auth/setup        →  creates first admin user, sets cookies
```

`/auth/setup` is a one-shot endpoint. It returns 400 if any user already exists.

### Login

```
POST /auth/login  →  body: { email, password }
```

1. Look up user by email (CITEXT comparison — case-insensitive)
2. Check Redis for replay: SHA-256 hash of request body → 10-min TTL
3. Verify Argon2id password hash
4. If no user found: run a dummy verify to prevent timing attacks
5. Set `access_token` + `refresh_token` cookies
6. Update `user.last_login_at`

### Token Refresh

```
POST /auth/refresh  →  reads refresh_token cookie
```

Validates the refresh token, issues a new `access_token` cookie. Called proactively by the frontend before the access token expires.

### Logout

```
POST /auth/logout
```

Clears both cookies by setting them to empty with `max_age=0`.

---

## FastAPI Dependencies

### `get_current_user`

Use on every protected route. Returns the `User` ORM object.

```python
from auth import get_current_user

@router.get("/plants")
async def list_plants(user: User = Depends(get_current_user), ...):
    ...
```

**Internal flow**:
1. Reads `access_token` cookie from the request
2. Decodes JWT, checks `type == "access"` and expiry
3. Parses `sub` as UUID → queries DB for User
4. Returns `User` or raises `401 Unauthorized`

### `require_role`

Use for admin-only routes. Wraps `get_current_user`.

```python
from auth import require_role

@router.get("/admin/users")
async def list_users(
    _: None = Depends(require_role("admin")),
    user: User = Depends(get_current_user),
    ...
):
    ...
```

Raises `403 Forbidden` if `user.role` is not in the allowed set.

**Never** write inline role checks like `if user.role != "admin": raise ...` — always use `require_role`.

---

## User Roles

| Role | Value | Description |
|---|---|---|
| Admin | `"admin"` | Can access `/admin/*` routes; created on first setup |
| Operator | `"operator"` | Default role; can only access their own data |

Role is stored as a `VARCHAR(20)` with default `"operator"`.

---

## Password Handling

- **Algorithm**: Argon2id via `argon2-cffi`
- **Field**: `user.password_hash` — **never include in any response schema**
- **Change password**: `POST /auth/change-password` requires `current_password` verification before accepting `new_password`
- **Temp passwords**: `user.is_password_temp = True` flags accounts where an admin set the password; frontend can prompt for a change

---

## Replay Attack Prevention

The `/auth/login` endpoint stores a SHA-256 hash of the raw request body in Redis with a 10-minute TTL. If the same body is submitted again within that window, the request is rejected. This prevents credential-stuffing replay attacks.

Redis key pattern: `login_replay:{sha256_of_body}`

---

## Schemas (never return password_hash)

```python
# api/schemas/user.py

class UserResponse(BaseModel):
    id: UUID
    email: str
    display_name: Optional[str]
    role: str
    created_at: datetime
    last_login_at: Optional[datetime]
    is_password_temp: bool
    model_config = ConfigDict(from_attributes=True)
    # Note: password_hash is NOT included
```

---

## Frontend Token State

The frontend holds `token` as React state (initialised from `getToken()`) **solely to drive the UI** — to decide whether to show the auth screen or the main app. It is **not** used in API calls; the browser cookie handles authentication automatically.

When `token` is null → render `<AuthScreen>`.
When `token` is set → render the main app and load data.

---

## Security Checklist for New Routes

- [ ] Add `user: User = Depends(get_current_user)` to every protected route
- [ ] Check ownership: `Model.user_id == user.id` on every query
- [ ] Use `require_role("admin")` for admin routes — no inline role checks
- [ ] Never return `password_hash` in any schema
- [ ] Never set/read cookies from JavaScript
