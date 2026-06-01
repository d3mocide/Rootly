from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime
from typing import List
from database import get_db
from models.user import User
from models.plant import Plant
from schemas.plant import PlantCreate, PlantUpdate, PlantResponse
from auth import get_current_user

router = APIRouter(prefix="/plants", tags=["plants"])


@router.get("", response_model=List[PlantResponse])
def list_plants(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Plant).filter(Plant.user_id == user.id).all()


@router.post("", response_model=PlantResponse, status_code=status.HTTP_201_CREATED)
def create_plant(body: PlantCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plant = Plant(**body.model_dump(), user_id=user.id)
    db.add(plant)
    db.commit()
    db.refresh(plant)
    return plant


@router.get("/{plant_id}", response_model=PlantResponse)
def get_plant(plant_id: UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plant = db.query(Plant).filter(Plant.id == plant_id, Plant.user_id == user.id).first()
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    return plant


@router.put("/{plant_id}", response_model=PlantResponse)
def update_plant(plant_id: UUID, body: PlantUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plant = db.query(Plant).filter(Plant.id == plant_id, Plant.user_id == user.id).first()
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    for key, value in body.model_dump(exclude_none=True).items():
        setattr(plant, key, value)
    db.commit()
    db.refresh(plant)
    return plant


@router.delete("/{plant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plant(plant_id: UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plant = db.query(Plant).filter(Plant.id == plant_id, Plant.user_id == user.id).first()
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    db.delete(plant)
    db.commit()


@router.post("/{plant_id}/water", response_model=PlantResponse)
def water_plant(plant_id: UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    plant = db.query(Plant).filter(Plant.id == plant_id, Plant.user_id == user.id).first()
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    plant.last_water = datetime.utcnow()
    plant.moisture = 1.0
    plant.status = "watered"
    db.commit()
    db.refresh(plant)
    return plant
