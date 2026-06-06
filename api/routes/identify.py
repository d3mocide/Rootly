import httpx
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user
from config import settings
from database import get_db
from models.user import User
from schemas.plant_profile import PlantProfileResponse
from services.plant_identification import identify_from_image
from services.plantbook import get_detail, search

router = APIRouter(prefix="/identify", tags=["identify"])

_ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"}
_MAX_BYTES = 10 * 1024 * 1024  # 10 MB


@router.post("")
async def identify_plant(
    image: UploadFile = File(...),
    _user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not settings.plantnet_api_key:
        raise HTTPException(status_code=503, detail="Plant identification not configured")

    content_type = image.content_type or "image/jpeg"
    if content_type not in _ALLOWED_TYPES:
        raise HTTPException(status_code=415, detail="Unsupported image format")

    data = await image.read()
    if len(data) > _MAX_BYTES:
        raise HTTPException(status_code=413, detail="Image too large (max 10 MB)")

    try:
        match = await identify_from_image(data, content_type)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"PlantNet unavailable: {exc}")

    if not match:
        return {"scientific_name": None, "common_name": None, "score": 0.0, "plantbook_pid": None, "profile": None}

    pid = None
    profile_data = None
    has_plantbook = settings.plantbook_api_key or settings.plantbook_client_id

    if has_plantbook:
        try:
            results = await search(match["scientific_name"])
            if results:
                pid = results[0]["pid"]
                profile = await get_detail(pid, db)
                if profile:
                    profile_data = PlantProfileResponse.model_validate(profile).model_dump()
        except httpx.HTTPError:
            pass  # PlantBook unavailable — still return PlantNet result

    return {
        "scientific_name": match["scientific_name"],
        "common_name": match["common_name"],
        "score": match["score"],
        "plantbook_pid": pid,
        "profile": profile_data,
    }
