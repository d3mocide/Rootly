import hashlib
import uuid
from datetime import datetime, timedelta, timezone

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
import jwt
from fastapi import Cookie, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import redis.asyncio as aioredis

from config import settings
from database import get_db

ph = PasswordHasher()

# Pre-computed hash used to ensure constant response time when user is not found
_DUMMY_HASH = ph.hash("rootly-timing-guard-dummy")

_redis = aioredis.from_url(settings.redis_url, decode_responses=True)


def hash_password(plain: str) -> str:
    return ph.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return ph.verify(hashed, plain)
    except VerifyMismatchError:
        return False


def _dummy_verify() -> None:
    """Run a real Argon2 verify to normalise response time on missing-user path."""
    try:
        ph.verify(_DUMMY_HASH, "timing-guard")
    except VerifyMismatchError:
        pass


def create_token(user_id: uuid.UUID, token_type: str, expire_delta: timedelta) -> str:
    payload = {
        "sub": str(user_id),
        "type": token_type,
        "exp": datetime.now(timezone.utc) + expire_delta,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def create_access_token(user_id: uuid.UUID) -> str:
    return create_token(user_id, "access", timedelta(minutes=settings.access_token_expire_minutes))


def create_refresh_token(user_id: uuid.UUID) -> str:
    return create_token(user_id, "refresh", timedelta(days=settings.refresh_token_expire_days))


async def check_replay(request: Request) -> None:
    body = await request.body()
    body_hash = hashlib.sha256(body).hexdigest()
    key = f"replay:{body_hash}"
    if await _redis.exists(key):
        raise HTTPException(status_code=409, detail="Duplicate request")
    await _redis.setex(key, 600, "1")


async def get_current_user(
    access_token: str = Cookie(default=None),
    db: AsyncSession = Depends(get_db),
):
    from models.user import User

    exc = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    if not access_token:
        raise exc
    try:
        payload = jwt.decode(access_token, settings.jwt_secret, algorithms=["HS256"])
        if payload.get("type") != "access":
            raise exc
        user_id: str = payload.get("sub")
    except jwt.PyJWTError:
        raise exc

    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise exc
    return user


def require_role(*roles: str):
    async def _check(user=Depends(get_current_user)):
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")

    return Depends(_check)
