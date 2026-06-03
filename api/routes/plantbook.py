from typing import List

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user
from config import settings
from database import get_db
from models.user import User
from schemas.plant_profile import PlantProfileResponse, PlantSearchResult
from services.plantbook import search, get_detail

router = APIRouter(prefix="/plantbook", tags=["plantbook"])


def _require_key() -> None:
    if not settings.plantbook_client_id or not settings.plantbook_client_secret:
        raise HTTPException(status_code=503, detail="PlantBook API not configured")


@router.get("/search", response_model=List[PlantSearchResult])
async def search_plants(
    q: str = Query(..., min_length=2),
    _user: User = Depends(get_current_user),
) -> List[PlantSearchResult]:
    _require_key()
    try:
        return await search(q)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"PlantBook unavailable: {exc}")


@router.get("/detail/{pid}", response_model=PlantProfileResponse)
async def plant_detail(
    pid: str,
    _user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PlantProfileResponse:
    _require_key()
    try:
        profile = await get_detail(pid, db)
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"PlantBook unavailable: {exc}")
    if not profile:
        raise HTTPException(status_code=404, detail="Species not found")
    return profile
