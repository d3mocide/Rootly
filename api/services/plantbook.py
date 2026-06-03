import json
import logging
import time

import httpx
import redis.asyncio as aioredis
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config import settings
from models.plant_profile import PlantProfile

logger = logging.getLogger(__name__)

PLANTBOOK_BASE = "https://open.plantbook.io/api/v1"
SEARCH_CACHE_TTL = 3600  # 1 hour
# Refresh token 60 s before expiry to avoid using a token that expires mid-request
_TOKEN_EXPIRY_BUFFER = 60

_redis = aioredis.from_url(settings.redis_url, decode_responses=True)

# Module-level in-memory token cache (pid, expiry_epoch)
_token_cache: dict = {"token": None, "expires_at": 0.0}


async def _get_access_token() -> str:
    """Return a valid Bearer token, fetching a new one when the cached one expires."""
    # Check in-memory cache first (avoids a Redis round-trip on every request)
    if _token_cache["token"] and time.monotonic() < _token_cache["expires_at"]:
        return _token_cache["token"]

    # Fall back to Redis (shared across workers/restarts)
    cached = await _redis.get("plantbook:access_token")
    if cached:
        _token_cache["token"] = cached
        # We don't know exact expiry from Redis, so schedule a refresh in 5 min
        _token_cache["expires_at"] = time.monotonic() + 300
        return cached

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.post(
            f"{PLANTBOOK_BASE}/token/",
            data={
                "grant_type": "client_credentials",
                "client_id": settings.plantbook_client_id,
                "client_secret": settings.plantbook_client_secret,
            },
        )
        resp.raise_for_status()

    data = resp.json()
    token = data["access_token"]
    expires_in = int(data.get("expires_in", 3600))

    ttl = max(expires_in - _TOKEN_EXPIRY_BUFFER, 60)
    await _redis.setex("plantbook:access_token", ttl, token)
    _token_cache["token"] = token
    _token_cache["expires_at"] = time.monotonic() + ttl
    return token


async def _auth_header() -> dict:
    token = await _get_access_token()
    return {"Authorization": f"Bearer {token}"}


async def search(query: str) -> list[dict]:
    key = f"plantbook:search:{query.lower().strip()}"
    cached = await _redis.get(key)
    if cached:
        return json.loads(cached)

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(
                f"{PLANTBOOK_BASE}/plant/search/",
                params={"alias": query, "limit": 10},
                headers=await _auth_header(),
            )
            resp.raise_for_status()
        except httpx.HTTPStatusError as exc:
            logger.error(
                "PlantBook search failed: HTTP %s for query %r — %s",
                exc.response.status_code, query, exc.response.text[:200],
            )
            raise
        except httpx.HTTPError as exc:
            logger.error("PlantBook search network error for query %r: %s", query, exc)
            raise

    results = [
        {
            "pid": r["pid"],
            "display_name": r.get("display_pid", r["pid"]),
            "alias": r.get("alias", ""),
        }
        for r in resp.json().get("results", [])
    ]
    await _redis.setex(key, SEARCH_CACHE_TTL, json.dumps(results))
    return results


async def get_detail(pid: str, db: AsyncSession) -> PlantProfile | None:
    result = await db.execute(select(PlantProfile).where(PlantProfile.pid == pid))
    profile = result.scalar_one_or_none()
    if profile:
        return profile

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(
            f"{PLANTBOOK_BASE}/plant/detail/{pid}/",
            headers=await _auth_header(),
        )
        if resp.status_code == 404:
            return None
        resp.raise_for_status()

    data = resp.json()
    profile = PlantProfile(
        pid=data["pid"],
        display_name=data.get("display_pid", data["pid"]),
        alias=data.get("alias", ""),
        min_soil_moist=data.get("min_soil_moist"),
        max_soil_moist=data.get("max_soil_moist"),
        min_light_lux=data.get("min_light_lux"),
        max_light_lux=data.get("max_light_lux"),
        min_temp=data.get("min_temp"),
        max_temp=data.get("max_temp"),
        min_env_humid=data.get("min_env_humid"),
        max_env_humid=data.get("max_env_humid"),
        image_url=data.get("image_url", ""),
    )
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile
