from datetime import datetime, timezone
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user
from database import get_db
from models.plant import Plant
from models.user import User
from schemas.plant import PlantCreate, PlantResponse, PlantUpdate

router = APIRouter(prefix="/plants", tags=["plants"])


@router.get("", response_model=List[PlantResponse])
async def list_plants(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Plant).where(Plant.user_id == user.id))
    return result.scalars().all()


@router.post("", response_model=PlantResponse, status_code=status.HTTP_201_CREATED)
async def create_plant(body: PlantCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    plant = Plant(**body.model_dump(), user_id=user.id)
    db.add(plant)
    await db.commit()
    await db.refresh(plant)
    return plant


@router.get("/{plant_id}", response_model=PlantResponse)
async def get_plant(plant_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Plant).where(Plant.id == plant_id, Plant.user_id == user.id))
    plant = result.scalar_one_or_none()
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    return plant


@router.put("/{plant_id}", response_model=PlantResponse)
async def update_plant(
    plant_id: UUID, body: PlantUpdate,
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Plant).where(Plant.id == plant_id, Plant.user_id == user.id))
    plant = result.scalar_one_or_none()
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    for key, value in body.model_dump(exclude_none=True).items():
        setattr(plant, key, value)
    await db.commit()
    await db.refresh(plant)
    return plant


@router.delete("/{plant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plant(plant_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Plant).where(Plant.id == plant_id, Plant.user_id == user.id))
    plant = result.scalar_one_or_none()
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    await db.delete(plant)
    await db.commit()


@router.post("/{plant_id}/water", response_model=PlantResponse)
async def water_plant(plant_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Plant).where(Plant.id == plant_id, Plant.user_id == user.id))
    plant = result.scalar_one_or_none()
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    plant.last_water = datetime.now(timezone.utc).replace(tzinfo=None)
    plant.moisture = 1.0
    plant.status = "watered"
    await db.commit()
    await db.refresh(plant)
    return plant
