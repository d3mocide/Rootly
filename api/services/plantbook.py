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
_TOKEN_EXPIRY_BUFFER = 60

_redis = aioredis.from_url(settings.redis_url, decode_responses=True)

_token_cache: dict = {"token": None, "expires_at": 0.0}


async def _get_access_token() -> str:
    """Fetch (and cache) an OAuth2 Bearer token using client credentials."""
    if _token_cache["token"] and time.monotonic() < _token_cache["expires_at"]:
        return _token_cache["token"]

    cached = await _redis.get("plantbook:access_token")
    if cached:
        _token_cache["token"] = cached
        _token_cache["expires_at"] = time.monotonic() + 300
        return cached

    token_url = f"{PLANTBOOK_BASE}/token/"
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.post(
                token_url,
                data={
                    "grant_type": "client_credentials",
                    "client_id": settings.plantbook_client_id,
                    "client_secret": settings.plantbook_client_secret,
                    "scope": "read",
                },
            )
            resp.raise_for_status()
        except httpx.HTTPStatusError as exc:
            logger.error(
                "PlantBook token fetch failed: HTTP %s at %s — %s",
                exc.response.status_code, token_url, exc.response.text[:300],
            )
            raise
        except httpx.HTTPError as exc:
            logger.error("PlantBook token fetch network error at %s: %s", token_url, exc)
            raise

    data = resp.json()
    token = data["access_token"]
    expires_in = int(data.get("expires_in", 3600))

    ttl = max(expires_in - _TOKEN_EXPIRY_BUFFER, 60)
    await _redis.setex("plantbook:access_token", ttl, token)
    _token_cache["token"] = token
    _token_cache["expires_at"] = time.monotonic() + ttl
    logger.info("PlantBook access token acquired (expires in %ss)", expires_in)
    return token


async def _auth_header() -> dict:
    # API-key auth is simpler and never expires — prefer it when configured
    if settings.plantbook_api_key:
        return {"Authorization": f"Token {settings.plantbook_api_key}"}
    token = await _get_access_token()
    return {"Authorization": f"Bearer {token}"}


async def search(query: str) -> list[dict]:
    key = f"plantbook:search:{query.lower().strip()}"
    cached = await _redis.get(key)
    if cached:
        return json.loads(cached)

    search_url = f"{PLANTBOOK_BASE}/plant/search"
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(
                search_url,
                params={"alias": query, "limit": 10},
                headers=await _auth_header(),
            )
            resp.raise_for_status()
        except httpx.HTTPStatusError as exc:
            logger.error(
                "PlantBook search failed: HTTP %s at %s for query %r — %s",
                exc.response.status_code, exc.response.url, query, exc.response.text[:200],
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
            params={"include": "care"},
            headers=await _auth_header(),
        )
        if resp.status_code == 404:
            return None
        if not resp.is_success:
            logger.error(
                "PlantBook detail failed: HTTP %s for pid %r — %s",
                resp.status_code, pid, resp.text[:300],
            )
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
