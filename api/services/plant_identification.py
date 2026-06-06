import logging

import httpx

from config import settings

logger = logging.getLogger(__name__)

PLANTNET_BASE = "https://my-api.plantnet.org/v2"


async def identify_from_image(image_bytes: bytes, content_type: str) -> dict | None:
    """Submit an image to PlantNet and return the top match, or None if no match."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.post(
                f"{PLANTNET_BASE}/identify/all",
                params={"api-key": settings.plantnet_api_key, "nb-results": 1, "lang": "en"},
                files={"images": ("plant", image_bytes, content_type)},
                data={"organs": "auto"},
            )
            resp.raise_for_status()
        except httpx.HTTPStatusError as exc:
            logger.error(
                "PlantNet identify failed: HTTP %s — %s",
                exc.response.status_code, exc.response.text[:300],
            )
            raise
        except httpx.HTTPError as exc:
            logger.error("PlantNet identify network error: %s", exc)
            raise

    results = resp.json().get("results", [])
    if not results:
        return None

    top = results[0]
    species = top.get("species", {})
    common_names = species.get("commonNames", [])
    return {
        "scientific_name": species.get("scientificNameWithoutAuthor") or species.get("scientificName", ""),
        "common_name": common_names[0] if common_names else "",
        "score": top.get("score", 0.0),
    }
