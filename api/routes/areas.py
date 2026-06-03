from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from auth import get_current_user
from database import get_db
from models.area import Area
from models.user import User
from schemas.area import AreaCreate, AreaResponse
from uuid import UUID

router = APIRouter(prefix="/areas", tags=["areas"])

@router.get("", response_model=list[AreaResponse])
async def list_areas(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Area).where(Area.user_id == user.id))
    return result.scalars().all()

@router.post("", response_model=AreaResponse, status_code=status.HTTP_201_CREATED)
async def create_area(body: AreaCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    area = Area(**body.model_dump(), user_id=user.id)
    db.add(area)
    await db.commit()
    await db.refresh(area)
    return area

@router.delete("/{area_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_area(area_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Area).where(Area.id == area_id, Area.user_id == user.id))
    area = result.scalar_one_or_none()
    if not area:
        raise HTTPException(status_code=404, detail="Area not found")
    await db.delete(area)
    await db.commit()
