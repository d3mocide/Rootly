from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional, List
from models.plant import PlantKind, PlantStatus


class PlantCreate(BaseModel):
    name: str
    species: str = ""
    kind: PlantKind
    room: str = ""
    moisture: float = 0.5
    status: PlantStatus = PlantStatus.thriving
    every: int = 7
    light: str = ""
    note: str = ""
    growth: List[float] = []
    last_water: Optional[datetime] = None


class PlantUpdate(BaseModel):
    name: Optional[str] = None
    species: Optional[str] = None
    kind: Optional[PlantKind] = None
    room: Optional[str] = None
    moisture: Optional[float] = None
    status: Optional[PlantStatus] = None
    every: Optional[int] = None
    light: Optional[str] = None
    note: Optional[str] = None
    growth: Optional[List[float]] = None
    last_water: Optional[datetime] = None


class PlantResponse(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    species: str
    kind: PlantKind
    room: str
    moisture: float
    status: PlantStatus
    every: int
    light: str
    note: str
    growth: List[float]
    last_water: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}
