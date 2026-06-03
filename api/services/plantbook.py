import json
import logging

import httpx
import redis.asyncio as aioredis
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config import settings
from models.plant_profile import PlantProfile

logger = logging.getLogger(__name__)

PLANTBOOK_BASE = "https://open.plantbook.io/api/v1"
SEARCH_CACHE_TTL = 3600  # 1 hour

_redis = aioredis.from_url(settings.redis_url, decode_responses=True)


def _auth_header() -> dict:
    return {"Authorization": f"Token {settings.plantbook_api_key}"}


async def search(query: str) -> list[dict]:
    key = f"plantbook:search:{query.lower().strip()}"
    cached = await _redis.get(key)
    if cached:
        return json.loads(cached)

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(
            f"{PLANTBOOK_BASE}/plant/search/",
            params={"alias": query, "limit": 10},
            headers=_auth_header(),
        )
        resp.raise_for_status()

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
            headers=_auth_header(),
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
